import "../index.css"
import mono from "../assets/mono-panel.jpg"
import poly from "../assets/poly-panel.jpg"
import thin from "../assets/thin-panel.jpg"
import PropTypes from 'prop-types'

const Description = () => {
    const Card = ({ title, priceRange, details, imgSrc}) => (
        <div className="bg-blue-900 bgmb-3 w-18rem p-3 mt-2 m-4 shadow-2xl rounded-xl drop-shadow-2xl bg-opacity-60 hover:bg-blue-950">
            <img src={imgSrc} className="rounded-xl opacity-75 shadow-2xl" alt={title}/>
            <div className="card-body text-left text-slate-200 space-y-2">
                <h5 className="text-center card-title mb-3 mt-4 font-bold underline underline-offset-2">{title}</h5>
                <ul className="list-disc list-inside">
                    <li className="card-text text-gray-200 font-bold">{priceRange}</li>
                    <p></p>
                    {details.map((detail, index) => (
                        <li key={index} className="card-text text-slate-200">{detail}</li>
                    ))}
                </ul>
            </div>
        </div>
);
    const monocrystallineDetails = [
        'Typically 15-20% efficiency, ⠀⠀some models exceed 22%',
        'Lasts 25 years or more',
        'Better performance in low ⠀⠀light conditions compared ⠀⠀to other panel types',
        'Performance can degrade at ⠀⠀higher temperatures',
    ];

    const polycrystallineDetails = [
        'Efficiency typically around ⠀⠀13-16%',
        'Lasts 25 years or more',
        'Slightly reduced ⠀⠀performance in low light ⠀⠀conditions compared to ⠀⠀monocrystalline panels',
        'Efficiency can drop more ⠀⠀significantly in high ⠀⠀temperatures',
    ];
    const thinFilmDetails = [
        'Efficiency typically around ⠀⠀10-12%',
        'Flexible and lightweight',
        'Lower cost compared to ⠀⠀silicon-based panels',
        'Shorter lifespan, usually ⠀⠀around 10-15 years',
        'Better performance in high ⠀⠀temperatures and partial ⠀⠀shading',
    ];
        return (
            <div className="container mx-auto mt-4 flex-col space-x-5">
                <div className="flex flex-wrap justify-center">
                <Card
                    title="Monocrystalline"
                    priceRange="$1 - $1.50 per watt"
                    details={monocrystallineDetails}
                    imgSrc={mono}
                />
                <Card
                    title="Polycrystalline"
                    priceRange="$0.9 - $1.50 per watt"
                    details={polycrystallineDetails}
                    imgSrc={poly}
                />
                <Card className="text-align: justify;"
                    title="Thin Film"
                    priceRange="$0.5 - $1.50 per watt"
                    details={thinFilmDetails}
                    imgSrc={thin}
                />
                </div>
            </div>
        );
}

Description.propTypes = {
    title: PropTypes.string.isRequired,
    priceRange: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    imgSrc: PropTypes.string.isRequired,
}
export default Description;