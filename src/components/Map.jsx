import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import star from '../assets/images/star.png';
import half from '../assets/images/half.png';
import '../assets/images/star.css'
import { getCompletion } from './GPTDescription';
import Spinner from './Spinner'

const Map = () => {
    const [radiuskm, setRadiuskm] = useState(2);
    const [location, setLocation] = useState('');
    const [targetCoordinates, setTargetCoordinates] = useState([0, 0]); //coordinates for the country that you want to navigate to, through the sidebar button
    const [map, setMap] = useState(null);
    const [currentMarker, setCurrentMarker] = useState(null);
    const [currentCircle, setCurrentCircle] = useState(null);
    const [scale, setScale] = useState(2)
    const [loading, setLoading] = useState(false); //state for whether it is currently making an API request

    // Initialize the map
    useEffect(() => {
        const initialMap = L.map('map').setView([targetCoordinates[0], targetCoordinates[1]], scale); // coordinates for initial view

        // Add a tile layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(initialMap);

        setMap(initialMap);

        // Cleanup map when component unmounts
        return () => {
            initialMap.remove();
        };
    }, [targetCoordinates, scale]);

    // Handle map clicks
    useEffect(() => {
        if (!map) return;

        const onMapClick = async (e) => {
            if (loading) {
                return
            }

            if (currentMarker && currentCircle) {
                currentMarker.remove();
                currentCircle.remove();
            }

            const latitude = e.latlng.lat;
            const longitude = e.latlng.lng;

            const newMarker = L.marker([latitude, longitude]).addTo(map);
            setCurrentMarker(newMarker);

            const radiusPx = radiuskm * 1000; //convert km to px
            const newCircle = L.circle([latitude, longitude], {
                color: '#4b734e',
                fillColor: '#1c5721',
                fillOpacity: 0.5,
                radius: radiusPx
            }).addTo(map);

            setCurrentCircle(newCircle);
            
            console.log(latitude, longitude)
            //send the latitude and longitude to python backend for processing 
            setLoading(true); //disable clicking on other spots while processing the python api request
            const response = await fetch('http://localhost:3500/process_coordinates', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latitude: String(latitude), longitude: String(longitude), radius: String(radiusPx) }), 
            });
          
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
          
            const data = await response.json();
            const solarPotentialVal = data[0]
            const solarIrradiance = data[1]
            
            setLoading(false)
            console.log(solarPotentialVal)

            let numStars = (solarPotentialVal / 100) * 5
            numStars = numStars > 5 ? 5 : numStars
            numStars = Math.round(numStars * 2) / 2 //this rounds decimals to either nearest whole number or .5
            console.log(numStars)
            
            const chatGPTDescription = async (numStars, clickedLocation) => {
                return await getCompletion(numStars, clickedLocation)
            }

            const getClickLocation = async (latitude, longitude) => {
                try {
                    const apiKey = 'e05d15f41cad4b1bb27d91931d0bbfcb';
                    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`);
                    const data = await response.json();

                    if (data.results.length > 0) {
                        const components = data.results[0].components;
                        const city = components.city || components.town || components.village || '';
                        const state = components.state || '';
                        const country = components.country || '';
                        const locationName = `${city}${city && state ? ', ' : ''}${state}${(city || state) && country ? ', ' : ''}${country}`;
                        
                        return locationName;

                    } else {
                        console.log(`No location found for coordinates (${latitude}, ${longitude})`);
                        return 'Unknown'
                    }
                } catch (error) {
                    console.log(`Error: ${error}`);
                }
            }
            
            const clickedLocation = await getClickLocation(latitude, longitude)
            const description = await chatGPTDescription(numStars, clickedLocation)

            newCircle.bindPopup(`
                <div class="alert alert-primary d-flex align-items-center" role="alert">
                    <div class="alert alert-primary align-items: center;" role="alert">
                        <h4>${clickedLocation}</h4>
                        <div class="alert-heading-1" >
                            ${Array.from({ length: Math.floor(numStars) }).map((_, i) => `<img key=${i} src="${star}" alt="star" width="20" height="20" />`).join('')}
                            ${Array.from({ length: Math.round(numStars - Math.floor(numStars))}).map((_, i) => `<img key=${i} src="${half}" alt="star" width="10" height="10" />`).join('')} 
                        </div>
                        <span style="font-size: 13px; font-weight: bold; margin-top: 10px; display: block;"> Solar Panel Potential ${numStars} / 5</span>
                        <span style="font-size: 13px; margin-top: 10px; display: block;"> Solar Irradiance ${solarIrradiance} W/m\u00B2</span>
                        <hr />
                        <p class="mb-0">${description}</p>
                    </div>
                </div>
            `).openPopup();
        };

        map.on('click', onMapClick);

        // Cleanup event listener
        return () => {
            map.off('click', onMapClick);
        };
    }, [map, currentMarker, currentCircle, radiuskm, loading]);

    // Update circle radius when radiuskm changes
    useEffect(() => {
        if (currentCircle) {
            currentCircle.setRadius(radiuskm * 1000); // Convert km to meters
        }
    }, [radiuskm, currentCircle]);

    const locationSubmit = async (event) => {
        event.preventDefault();
        const apiKey = 'e05d15f41cad4b1bb27d91931d0bbfcb'; // Replace with your OpenCage API key

        try {
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${apiKey}`);
            const data = await response.json();
            if (data.results.length > 0) {
                const coordinates = data.results[0].geometry;
                console.log([coordinates.lat, coordinates.lng])
                setTargetCoordinates([coordinates.lat, coordinates.lng])
            } else {
                window.alert(`No coordinates found for ${location}. Maybe check your spelling?`)
            }

            const components = data.results[0].components;
            const isCity = components.city || components.town || components.village
            const isState = components.state
            const isCountry = components.country
            
            if (isCity){
                setScale(11)
            } else if (isState){
                setScale(5)
            } else if (isCountry){
                setScale(4)
            } else {
                setScale(2)
            }
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    };

    return (
        <div className='w-5/6 flex min-h-screen p-10 bg-indigo-900 rounded-3xl space-x-8 mt-8'>
            <div className="mb-12 mt-40">
                <div>
                    <form onSubmit={locationSubmit}>
                        <label htmlFor="location" className="block font-bold mb-3 text-white text-center text-lg items-center">Search for a location:</label>
                        <div className='flex'>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                                className='w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-900'
                                placeholder='Enter location'
                            />
                            <button type="submit" className=' flex ml-4 rounded-md py-1 px-2 bg-blue-700 text-center items-center justify-center hover:bg-blue-800'>
                                <p className='text-center mt-3 font-bold text-white hover:text-gray-100'>Go!</p>
                            </button>
                        </div>
                    </form>
                </div>
                <div className="mb-12 mt-16">
                    <label htmlFor="type" className="block font-bold mb-3 text-white text-center text-lg items-center">Search Area Radius:</label>
                    <select
                        id="type"
                        name="type"
                        className="border rounded w-full py-3 px-3"
                        required
                        value={radiuskm}
                        onChange={(event) => setRadiuskm(Number(event.target.value))}
                    >
                        <option value={0.5}>1/2 km</option>
                        <option value={1}>1 km</option>
                        <option value={2}>2 km</option>
                        <option value={3}>3 km</option>
                        <option value={5}>5 km</option>
                        <option value={10}>10 km</option>
                        <option value={50}>50 km</option>
                        <option value={100}>100 km</option>
                    </select>
                </div>
            </div>
            <div className='rounded-lg' id="map" style={{ width: '100%', boxShadow: 'none', zIndex: 0}}></div>
            {loading ? <Spinner /> : <></>}
        </div>
    );
};

export default Map;
