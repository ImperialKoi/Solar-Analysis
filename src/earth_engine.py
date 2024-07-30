import ee
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from io import BytesIO, StringIO
from PIL import Image
import numpy as np
import cv2
import base64
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from io import BytesIO
import json
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
import requests

app = FastAPI()

#allows requests from any domain, with any method, and lift restrictions on credentials needed to make requests
#CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

class CoordinatesReq(BaseModel):
    latitude: str
    longitude: str
    radius: str

def average_red_channel(pixel_values):
    red_values = [pixel_values[i] for i in range(0, len(pixel_values), 3)]
    if red_values:
        return sum(red_values) / len(red_values)
    return 0

def download_image(url):
    response = requests.get(url)
    img = Image.open(BytesIO(response.content))
    return img

def extract_pixel_values(img):
    img = np.array(img)
    pixel_values = img.flatten().tolist()
    return pixel_values

def find_solar_irrandiance(longitude, latitude, radius):
    #define the area of interest, based on radius of circle and center (latitude, longitude)
    center = ee.Geometry.Point([longitude, latitude])
    aoi = center.buffer(radius) #area of interest
    
    #compute the solar irradiance over the AOI, sum_solar_irradiance is in units J/m^2 accumulated over a month
    sum_solar_irradiance = dataset.mean().reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=aoi,
        scale=1000, #each pixel represents 1000 meters
        maxPixels=1e9
    )
    
    #get the average solar irradiance value in the area per day (/30 because sum_irradiance_value is the sum of values over a month)
    irradiance_value = (sum_solar_irradiance.getInfo()['surface_solar_radiation_downwards_sum'])/30
    #convert the irradiance value from J/m^2 to W/m^2
    irradiance_value = irradiance_value / 86400
    return irradiance_value
    
@app.post("/process_coordinates")
async def process_image(req: CoordinatesReq):
    latitude, longitude, radius = req.latitude, req.longitude, req.radius
    print(latitude, longitude, radius)
    
    solar_irradiance = find_solar_irrandiance(float(longitude), float(latitude), float(radius))

    #using the solar_irradiance, determine the potential for using solar panels with this formula:
    # (average solar irradiance in this area) / (maximum solar irradiance possible near surface (300 W/m^2))
    if solar_irradiance/250 >= 1:
        ratio = 1
    else:
        ratio = solar_irradiance/250
    solar_potential = f'{(round(ratio, 2)*100)}'
    
    json_compatible_item_data = jsonable_encoder([solar_potential, str(round(solar_irradiance, 3))])
    return JSONResponse(content=json_compatible_item_data)

if __name__ == "__main__":
    ee.Authenticate()
    ee.Initialize(project='ee-imperialkoi9')
    print('API Login Successful')
    
    #load the ERA5 dataset wit# Filter the dataset for a specific time range
    dataset = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR").select('surface_solar_radiation_downwards_sum')
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3500)