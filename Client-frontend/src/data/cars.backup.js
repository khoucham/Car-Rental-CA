import yarisImg from "../cars/yaris.jpg";
import golfImg from "../cars/golf.jpg";
import bmwImg from "../cars/bmw.jpg";
import teslaImg from "../cars/tesla.jpg";
import toyotaLogo from "../brands/toyota.png";
import vwLogo from "../brands/vw.jpg";
import bmwLogo from "../brands/bmw.jpg";
import teslaLogo from "../brands/tesla.png";

const cars = [
  {
    id: 1,
    brand: "Toyota",
    model: "Yaris",
    year: 2021,
    type: "Economy",
    pricePerDay: 45,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    doors: 5,
    features: ["AC", "Bluetooth", "USB"],
    available: true,
    brandLogo: toyotaLogo,
    image: yarisImg
  },
  {
    id: 2,
    brand: "Volkswagen",
    model: "Golf",
    year: 2020,
    type: "Economy",
    pricePerDay: 60,
    transmission: "Manual",
    fuel: "Diesel",
    seats: 5,
    doors: 5,
    features: ["AC", "Bluetooth"],
    available: true,
    brandLogo: vwLogo,
    image: golfImg
  },
  {
    id: 3,
    brand: "BMW",
    model: "3 Series",
    year: 2019,
    type: "Luxury",
    pricePerDay: 95,
    transmission: "Automatic",
    fuel: "Hybrid",
    seats: 5,
    doors: 4,
    features: ["AC", "GPS", "Heated Seats"],
    available: true,
    brandLogo: bmwLogo,
    image: bmwImg
  },
  {
    id: 4,
    brand: "Tesla",
    model: "Model 3",
    year: 2022,
    type: "Electric",
    pricePerDay: 110,
    transmission: "Automatic",
    fuel: "Electric",
    seats: 5,
    doors: 4,
    features: ["GPS", "Autopilot", "Bluetooth"],
    available: true,
    brandLogo: teslaLogo,
    image: teslaImg
  },
  {
   id: 5,
    brand: "BMW",
    model: "5 Series",
    year: 2020,
    type: "Sport",
    pricePerDay: 95,
    transmission: "Automatic",
    fuel: "Hybrid",
    seats: 5,
    doors: 4,
    features: ["AC", "GPS", "Heated Seats"],
    available: true,
    brandLogo: bmwLogo,
    image: bmwImg
}
];

export default cars;
