import Map from '../components/Map'
import Description from "../components/Description.jsx";
import '../index.css'
import './HomePage.css'
import { useEffect, useRef } from 'react'

const HomePage = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const intervalRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        document.title = 'SPA: Solar Potential Analysis';
        const titleElement = titleRef.current;
        let iteration = 0;

        intervalRef.current = setInterval(() => {
            titleElement.innerText = titleElement.dataset.value
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return titleElement.dataset.value[index];
                    }

                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");

            if (iteration >= titleElement.dataset.value.length) {
                clearInterval(intervalRef.current);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(intervalRef.current); // Clean up on unmount
    }, [letters]);

    return (
    <div className='max-h-screen flex flex-col overflow-y-auto bg-indigo-950'>
        {/* SVG shape divider */}
        <div className="relative w-full">
            <div className="relative inset-x-0 top-0 overflow-y-auto">
                <svg 
                data-name="Layer 1" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1200 120" 
                preserveAspectRatio="none" 
                className="w-full h-auto"
                >
                <path 
                    id='light'
                    d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                    opacity=".25" 
                    className="fill-current text-blue-500"
                ></path>
                <path 
                    id='medium'
                    d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                    opacity=".5" 
                    className="fill-current text-blue-400"
                ></path>
                <path 
                    id='dark'
                    d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
                    className="fill-current text-blue-300"
                ></path>
                </svg>
            </div>
        </div>
        {/* Main content */}
        <div className='flex flex-col justify-center mt-10 items-center'>
            <h1 ref={titleRef} className='title flex flex-col text-7xl font-bold text-white my-4 text-center ' id="bestTitle" data-value="SOLAR POTENTIAL ANALYSIS">
                SOLAR POTENTIAL ANALYSIS
            </h1>
            <div className='flex mt-5 w-full justify-center items-center'>
                <Map />
            </div>
        </div>
        <section className="section blue" style={{ marginTop: '100px', padding: '20px', backgroundColor: '#1D1B4B', color: 'white' }}>
            <div className="position-absolute z-50 md-20">
                <Description />
            </div>
            <div className="curve" style={{ height: '100px', backgroundColor: '#1D1B4B' }}></div>
        </section>

        <section className="section" style={{ padding: '20px', backgroundColor: '#2a3b73', color: 'white' }}>
            <div className='mt-20'></div>
        </section>
        <section className="section red" style={{ padding: '20px', backgroundColor: '#39509e' }}>
          <div className='mt-44'>
            <h1> </h1>
          </div>
          <p> </p>
          <div className="wave">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                fill="#2a3b73"
              ></path>
            </svg>
          </div>
        </section>

        <div className="spacer layer2 flip" style={{ height: '20px', backgroundColor: '#ddd' }}></div>
    </div>
  );
};

export default HomePage;