import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Car brand logos from a reliable CDN
const getLogoUrl = (brand: string) => {
  const brandLogos: Record<string, string> = {
    'Toyota': 'https://www.carlogos.org/car-logos/toyota-logo.png',
    'Nissan': 'https://www.carlogos.org/car-logos/nissan-logo.png',
    'Mazda': 'https://www.carlogos.org/car-logos/mazda-logo.png',
    'Honda': 'https://www.carlogos.org/car-logos/honda-logo.png',
    'Suzuki': 'https://www.carlogos.org/car-logos/suzuki-logo.png',
    'Mitsubishi': 'https://www.carlogos.org/car-logos/mitsubishi-logo.png',
    'Isuzu': 'https://www.carlogos.org/car-logos/isuzu-logo.png',
    'Subaru': 'https://www.carlogos.org/car-logos/subaru-logo.png',
    'Lexus': 'https://www.carlogos.org/car-logos/lexus-logo.png',
    'Daihatsu': 'https://www.carlogos.org/car-logos/daihatsu-logo.png',
    'Volkswagen': 'https://www.carlogos.org/car-logos/volkswagen-logo.png',
    'BMW': 'https://www.carlogos.org/car-logos/bmw-logo.png',
    'Mercedes-Benz': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
    'Audi': 'https://www.carlogos.org/car-logos/audi-logo.png',
    'Porsche': 'https://www.carlogos.org/car-logos/porsche-logo.png',
    'Opel': 'https://www.carlogos.org/car-logos/opel-logo.png',
    'Hyundai': 'https://www.carlogos.org/car-logos/hyundai-logo.png',
    'Kia': 'https://www.carlogos.org/car-logos/kia-logo.png',
    'Ford': 'https://www.carlogos.org/car-logos/ford-logo.png',
    'Jeep': 'https://www.carlogos.org/car-logos/jeep-logo.png',
    'Chevrolet': 'https://www.carlogos.org/car-logos/chevrolet-logo.png',
    'Dodge': 'https://www.carlogos.org/car-logos/dodge-logo.png',
    'Cadillac': 'https://www.carlogos.org/car-logos/cadillac-logo.png',
    'RAM': 'https://www.carlogos.org/car-logos/ram-logo.png',
    'Haval': 'https://www.carlogos.org/car-logos/haval-logo.png',
    'GWM': 'https://www.carlogos.org/car-logos/great-wall-logo.png',
    'Chery': 'https://www.carlogos.org/car-logos/chery-logo.png',
    'BAIC': 'https://www.carlogos.org/car-logos/baic-logo.png',
    'JAC': 'https://www.carlogos.org/car-logos/jac-logo.png',
    'Foton': 'https://www.carlogos.org/car-logos/foton-logo.png',
    'BYD': 'https://www.carlogos.org/car-logos/byd-logo.png',
    'Land Rover': 'https://www.carlogos.org/car-logos/land-rover-logo.png',
    'Jaguar': 'https://www.carlogos.org/car-logos/jaguar-logo.png',
    'MINI': 'https://www.carlogos.org/car-logos/mini-logo.png',
    'Bentley': 'https://www.carlogos.org/car-logos/bentley-logo.png',
    'Rolls-Royce': 'https://www.carlogos.org/car-logos/rolls-royce-logo.png',
    'Renault': 'https://www.carlogos.org/car-logos/renault-logo.png',
    'Peugeot': 'https://www.carlogos.org/car-logos/peugeot-logo.png',
    'Citroën': 'https://www.carlogos.org/car-logos/citroen-logo.png',
    'Fiat': 'https://www.carlogos.org/car-logos/fiat-logo.png',
    'Alfa Romeo': 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png',
    'Ferrari': 'https://www.carlogos.org/car-logos/ferrari-logo.png',
    'Maserati': 'https://www.carlogos.org/car-logos/maserati-logo.png',
    'Lamborghini': 'https://www.carlogos.org/car-logos/lamborghini-logo.png',
    'Volvo': 'https://www.carlogos.org/car-logos/volvo-logo.png',
    'Skoda': 'https://www.carlogos.org/car-logos/skoda-logo.png',
    'Mahindra': 'https://www.carlogos.org/car-logos/mahindra-logo.png',
    'Tata': 'https://www.carlogos.org/car-logos/tata-logo.png',
    'Dacia': 'https://www.carlogos.org/car-logos/dacia-logo.png',
    'Omoda': 'https://www.carlogos.org/car-logos/chery-logo.png',
    'Jaecoo': 'https://www.carlogos.org/car-logos/chery-logo.png',
    'Genesis': 'https://www.carlogos.org/car-logos/genesis-logo.png',
    'Infiniti': 'https://www.carlogos.org/car-logos/infiniti-logo.png',
    'Acura': 'https://www.carlogos.org/car-logos/acura-logo.png',
    'Tesla': 'https://www.carlogos.org/car-logos/tesla-logo.png',
    'Rivian': 'https://www.carlogos.org/car-logos/rivian-logo.png',
    'Polestar': 'https://www.carlogos.org/car-logos/polestar-logo.png',
    'Cupra': 'https://www.carlogos.org/car-logos/cupra-logo.png',
    'SEAT': 'https://www.carlogos.org/car-logos/seat-logo.png',
    'Aston Martin': 'https://www.carlogos.org/car-logos/aston-martin-logo.png',
    'McLaren': 'https://www.carlogos.org/car-logos/mclaren-logo.png',
  }
  return brandLogos[brand] || null
}

// Comprehensive South African vehicle makes with countries
const carMakes = [
  // Japan
  { name: 'Toyota', country: 'Japan' },
  { name: 'Nissan', country: 'Japan' },
  { name: 'Mazda', country: 'Japan' },
  { name: 'Honda', country: 'Japan' },
  { name: 'Suzuki', country: 'Japan' },
  { name: 'Mitsubishi', country: 'Japan' },
  { name: 'Isuzu', country: 'Japan' },
  { name: 'Subaru', country: 'Japan' },
  { name: 'Lexus', country: 'Japan' },
  { name: 'Daihatsu', country: 'Japan' },
  { name: 'Infiniti', country: 'Japan' },
  { name: 'Acura', country: 'Japan' },
  // Germany
  { name: 'Volkswagen', country: 'Germany' },
  { name: 'BMW', country: 'Germany' },
  { name: 'Mercedes-Benz', country: 'Germany' },
  { name: 'Audi', country: 'Germany' },
  { name: 'Porsche', country: 'Germany' },
  { name: 'Opel', country: 'Germany' },
  // South Korea
  { name: 'Hyundai', country: 'South Korea' },
  { name: 'Kia', country: 'South Korea' },
  { name: 'Genesis', country: 'South Korea' },
  // USA
  { name: 'Ford', country: 'USA' },
  { name: 'Jeep', country: 'USA' },
  { name: 'Chevrolet', country: 'USA' },
  { name: 'Dodge', country: 'USA' },
  { name: 'Cadillac', country: 'USA' },
  { name: 'RAM', country: 'USA' },
  { name: 'Tesla', country: 'USA' },
  { name: 'Rivian', country: 'USA' },
  // China
  { name: 'Haval', country: 'China' },
  { name: 'GWM', country: 'China' },
  { name: 'Chery', country: 'China' },
  { name: 'BAIC', country: 'China' },
  { name: 'JAC', country: 'China' },
  { name: 'Foton', country: 'China' },
  { name: 'BYD', country: 'China' },
  { name: 'Omoda', country: 'China' },
  { name: 'Jaecoo', country: 'China' },
  // UK
  { name: 'Land Rover', country: 'UK' },
  { name: 'Jaguar', country: 'UK' },
  { name: 'MINI', country: 'UK' },
  { name: 'Bentley', country: 'UK' },
  { name: 'Rolls-Royce', country: 'UK' },
  { name: 'Aston Martin', country: 'UK' },
  { name: 'McLaren', country: 'UK' },
  // France
  { name: 'Renault', country: 'France' },
  { name: 'Peugeot', country: 'France' },
  { name: 'Citroën', country: 'France' },
  // Italy
  { name: 'Fiat', country: 'Italy' },
  { name: 'Alfa Romeo', country: 'Italy' },
  { name: 'Ferrari', country: 'Italy' },
  { name: 'Maserati', country: 'Italy' },
  { name: 'Lamborghini', country: 'Italy' },
  // Sweden
  { name: 'Volvo', country: 'Sweden' },
  { name: 'Polestar', country: 'Sweden' },
  // Spain
  { name: 'SEAT', country: 'Spain' },
  { name: 'Cupra', country: 'Spain' },
  // Czech Republic
  { name: 'Skoda', country: 'Czech Republic' },
  // India
  { name: 'Mahindra', country: 'India' },
  { name: 'Tata', country: 'India' },
  // Romania
  { name: 'Dacia', country: 'Romania' },
]

// Comprehensive SA vehicle models with specifications - 150+ models
const carModels: Record<string, Array<{
  name: string;
  year_from?: number;
  year_to?: number;
  engine_size?: string;
  fuel_type?: string;
  body_type?: string;
  transmission?: string;
}>> = {
  'Toyota': [
    { name: 'Corolla 1.6', year_from: 2019, engine_size: '1.6L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Manual' },
    { name: 'Corolla 1.8', year_from: 2019, engine_size: '1.8L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'CVT' },
    { name: 'Corolla Cross 1.8', year_from: 2021, engine_size: '1.8L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Corolla Cross Hybrid', year_from: 2021, engine_size: '1.8L Hybrid', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Hilux 2.4 GD-6', year_from: 2016, engine_size: '2.4L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Manual' },
    { name: 'Hilux 2.8 GD-6', year_from: 2016, engine_size: '2.8L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'Hilux 2.0 VVTi', year_from: 2016, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'Bakkie', transmission: 'Manual' },
    { name: 'Fortuner 2.4 GD-6', year_from: 2016, engine_size: '2.4L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Manual' },
    { name: 'Fortuner 2.8 GD-6', year_from: 2016, engine_size: '2.8L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'RAV4 2.0', year_from: 2019, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'RAV4 Hybrid', year_from: 2019, engine_size: '2.5L Hybrid', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Yaris 1.5', year_from: 2020, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'CVT' },
    { name: 'Yaris Cross', year_from: 2021, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Land Cruiser 300', year_from: 2021, engine_size: '3.3L V6 Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Land Cruiser Prado', year_from: 2018, engine_size: '2.8L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Starlet 1.4', year_from: 2020, engine_size: '1.4L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Urban Cruiser', year_from: 2020, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Manual' },
    { name: 'Agya 1.0', year_from: 2022, engine_size: '1.0L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Rumion 1.5', year_from: 2022, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'MPV', transmission: 'Manual' },
    { name: 'Veloz 1.5', year_from: 2022, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'MPV', transmission: 'CVT' },
    { name: 'bZ4X Electric', year_from: 2023, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Volkswagen': [
    { name: 'Polo 1.0 TSI', year_from: 2018, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Polo 1.0 TSI DSG', year_from: 2018, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'DSG' },
    { name: 'Polo GTI', year_from: 2018, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'DSG' },
    { name: 'Polo Vivo 1.4', year_from: 2014, engine_size: '1.4L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Polo Vivo 1.6', year_from: 2014, engine_size: '1.6L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Manual' },
    { name: 'Golf 8 1.4 TSI', year_from: 2020, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'DSG' },
    { name: 'Golf 8 GTI', year_from: 2021, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'DSG' },
    { name: 'Golf 8 R', year_from: 2021, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'DSG' },
    { name: 'T-Cross 1.0 TSI', year_from: 2019, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Manual' },
    { name: 'T-Roc 1.4 TSI', year_from: 2020, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DSG' },
    { name: 'Tiguan 1.4 TSI', year_from: 2016, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DSG' },
    { name: 'Tiguan 2.0 TDI', year_from: 2016, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'DSG' },
    { name: 'Tiguan Allspace', year_from: 2018, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DSG' },
    { name: 'Touareg V6 TDI', year_from: 2018, engine_size: '3.0L V6 Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Amarok 2.0 TDI', year_from: 2017, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Manual' },
    { name: 'Amarok V6 TDI', year_from: 2023, engine_size: '3.0L V6 Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'ID.4 Electric', year_from: 2023, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Ford': [
    { name: 'Ranger 2.0 Bi-Turbo', year_from: 2022, engine_size: '2.0L Bi-Turbo', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'Ranger 3.0 V6 Diesel', year_from: 2022, engine_size: '3.0L V6 Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'Ranger Raptor', year_from: 2022, engine_size: '3.0L V6 EcoBoost', fuel_type: 'Petrol', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'Everest 2.0 Bi-Turbo', year_from: 2022, engine_size: '2.0L Bi-Turbo', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Everest 3.0 V6 Diesel', year_from: 2022, engine_size: '3.0L V6 Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Fiesta 1.0 EcoBoost', year_from: 2018, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Fiesta ST', year_from: 2018, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Focus 1.0 EcoBoost', year_from: 2019, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Focus ST', year_from: 2019, engine_size: '2.3L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Puma 1.0 EcoBoost', year_from: 2021, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Mustang 2.3 EcoBoost', year_from: 2016, engine_size: '2.3L Turbo', fuel_type: 'Petrol', body_type: 'Coupe', transmission: 'Automatic' },
    { name: 'Mustang 5.0 V8', year_from: 2016, engine_size: '5.0L V8', fuel_type: 'Petrol', body_type: 'Coupe', transmission: 'Automatic' },
    { name: 'Bronco Sport', year_from: 2024, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Figo 1.5', year_from: 2018, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
  ],
  'Hyundai': [
    { name: 'i10 1.1', year_from: 2020, engine_size: '1.1L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'i20 1.2', year_from: 2021, engine_size: '1.2L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'i20 1.0T', year_from: 2021, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'DCT' },
    { name: 'i20 N', year_from: 2021, engine_size: '1.6L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'i30 1.4T', year_from: 2017, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'DCT' },
    { name: 'i30 N', year_from: 2018, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Venue 1.0T', year_from: 2020, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'Creta 1.5', year_from: 2022, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Creta 1.5T', year_from: 2022, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'Tucson 2.0', year_from: 2022, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Tucson 2.0 CRDi', year_from: 2022, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Santa Fe 2.2 CRDi', year_from: 2019, engine_size: '2.2L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Palisade 2.2 CRDi', year_from: 2021, engine_size: '2.2L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Staria 2.2 CRDi', year_from: 2022, engine_size: '2.2L Diesel', fuel_type: 'Diesel', body_type: 'MPV', transmission: 'Automatic' },
    { name: 'Kona 2.0', year_from: 2018, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Kona Electric', year_from: 2019, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Ioniq 5', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Ioniq 6', year_from: 2023, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Sedan', transmission: 'Automatic' },
  ],
  'Kia': [
    { name: 'Picanto 1.0', year_from: 2017, engine_size: '1.0L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Picanto 1.2', year_from: 2017, engine_size: '1.2L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'Rio 1.4', year_from: 2017, engine_size: '1.4L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'Cerato 1.6', year_from: 2019, engine_size: '1.6L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'CVT' },
    { name: 'Cerato 2.0', year_from: 2019, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'CVT' },
    { name: 'K3 1.5T', year_from: 2024, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'DCT' },
    { name: 'Sonet 1.0T', year_from: 2021, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'Seltos 1.4T', year_from: 2020, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'Sportage 1.6T', year_from: 2022, engine_size: '1.6L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'Sportage 2.0 CRDi', year_from: 2022, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Sorento 2.2 CRDi', year_from: 2021, engine_size: '2.2L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Carnival 2.2 CRDi', year_from: 2021, engine_size: '2.2L Diesel', fuel_type: 'Diesel', body_type: 'MPV', transmission: 'Automatic' },
    { name: 'EV6', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Niro EV', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'BMW': [
    { name: '1 Series 118i', year_from: 2020, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: '2 Series Gran Coupe', year_from: 2020, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: '3 Series 320i', year_from: 2019, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: '3 Series 320d', year_from: 2019, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'M3 Competition', year_from: 2021, engine_size: '3.0L Twin-Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: '4 Series 420i', year_from: 2021, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Coupe', transmission: 'Automatic' },
    { name: 'M4 Competition', year_from: 2021, engine_size: '3.0L Twin-Turbo', fuel_type: 'Petrol', body_type: 'Coupe', transmission: 'Automatic' },
    { name: '5 Series 520i', year_from: 2017, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: '5 Series 530d', year_from: 2024, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'X1 sDrive18i', year_from: 2023, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'X3 xDrive20i', year_from: 2018, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'X3 xDrive20d', year_from: 2018, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'X5 xDrive30d', year_from: 2019, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'X5 M Competition', year_from: 2020, engine_size: '4.4L V8 Twin-Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'X7 xDrive30d', year_from: 2019, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'iX xDrive40', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'iX3', year_from: 2021, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'i4 eDrive40', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Sedan', transmission: 'Automatic' },
  ],
  'Mercedes-Benz': [
    { name: 'A-Class A200', year_from: 2019, engine_size: '1.3L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'A-Class Sedan', year_from: 2019, engine_size: '1.3L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'AMG A45 S', year_from: 2020, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'C-Class C200', year_from: 2022, engine_size: '1.5L Turbo + Mild Hybrid', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'C-Class C220d', year_from: 2022, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'AMG C63 S', year_from: 2023, engine_size: '2.0L Turbo + Hybrid', fuel_type: 'Hybrid', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'E-Class E200', year_from: 2021, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'S-Class S500', year_from: 2021, engine_size: '3.0L Turbo + Mild Hybrid', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'GLA 200', year_from: 2020, engine_size: '1.3L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'GLB 200', year_from: 2020, engine_size: '1.3L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'GLC 300', year_from: 2020, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'GLC 220d', year_from: 2020, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'GLE 300d', year_from: 2019, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'AMG GLE 63 S', year_from: 2020, engine_size: '4.0L V8 Biturbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'GLS 400d', year_from: 2020, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'EQA 250', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'EQB 250', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'EQC 400', year_from: 2021, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Audi': [
    { name: 'A1 Sportback', year_from: 2019, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'A3 Sportback', year_from: 2021, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'S3 Sportback', year_from: 2021, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'A4 40 TFSI', year_from: 2020, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'A5 Sportback', year_from: 2020, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Coupe', transmission: 'Automatic' },
    { name: 'A6 45 TFSI', year_from: 2019, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'Q2 35 TFSI', year_from: 2017, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Q3 35 TFSI', year_from: 2019, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Q5 45 TFSI', year_from: 2017, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Q7 55 TFSI', year_from: 2020, engine_size: '3.0L V6 Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Q8 55 TFSI', year_from: 2019, engine_size: '3.0L V6 Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'e-tron 55', year_from: 2020, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Q4 e-tron', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Nissan': [
    { name: 'Micra 1.2', year_from: 2018, engine_size: '1.2L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Almera 1.5', year_from: 2020, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Manual' },
    { name: 'Magnite 1.0T', year_from: 2021, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Qashqai 1.3 DIG-T', year_from: 2022, engine_size: '1.3L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'X-Trail 2.5', year_from: 2022, engine_size: '2.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'X-Trail e-Power', year_from: 2023, engine_size: '1.5L Hybrid', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Navara 2.5 dCi', year_from: 2016, engine_size: '2.5L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Manual' },
    { name: 'Patrol 5.6 V8', year_from: 2020, engine_size: '5.6L V8', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'NP200 1.6', year_from: 2014, engine_size: '1.6L', fuel_type: 'Petrol', body_type: 'Bakkie', transmission: 'Manual' },
    { name: 'NP300 2.5 TDi', year_from: 2016, engine_size: '2.5L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Manual' },
    { name: 'Leaf Electric', year_from: 2019, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'Ariya Electric', year_from: 2023, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Mazda': [
    { name: 'Mazda2 1.5', year_from: 2020, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'Mazda3 2.0', year_from: 2019, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'Mazda3 Sedan', year_from: 2019, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'CX-3 2.0', year_from: 2018, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'CX-30 2.0', year_from: 2020, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'CX-5 2.0', year_from: 2017, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'CX-5 2.2d', year_from: 2017, engine_size: '2.2L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'CX-60 2.5 PHEV', year_from: 2023, engine_size: '2.5L PHEV', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'CX-90 3.3 Diesel', year_from: 2024, engine_size: '3.3L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'MX-5 2.0', year_from: 2016, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'Convertible', transmission: 'Manual' },
    { name: 'BT-50 3.0 Diesel', year_from: 2021, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
  ],
  'Honda': [
    { name: 'Jazz 1.5', year_from: 2020, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'CVT' },
    { name: 'City 1.5', year_from: 2020, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'CVT' },
    { name: 'Civic 1.5T', year_from: 2022, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'CVT' },
    { name: 'Civic Type R', year_from: 2023, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Accord 1.5T', year_from: 2020, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'CVT' },
    { name: 'HR-V 1.5', year_from: 2022, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'CR-V 1.5T', year_from: 2020, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'WR-V 1.5', year_from: 2023, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Manual' },
    { name: 'ZR-V e:HEV', year_from: 2024, engine_size: '2.0L Hybrid', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Amaze 1.2', year_from: 2018, engine_size: '1.2L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Manual' },
  ],
  'Suzuki': [
    { name: 'Swift 1.2', year_from: 2018, engine_size: '1.2L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Swift Sport', year_from: 2018, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Baleno 1.4', year_from: 2016, engine_size: '1.4L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Dzire 1.2', year_from: 2018, engine_size: '1.2L', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Manual' },
    { name: 'Jimny 1.5', year_from: 2019, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Manual' },
    { name: 'Jimny 5-door', year_from: 2024, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Manual' },
    { name: 'Vitara Brezza 1.5', year_from: 2022, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Grand Vitara Hybrid', year_from: 2023, engine_size: '1.5L Hybrid', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Fronx 1.0T', year_from: 2023, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'S-Presso 1.0', year_from: 2020, engine_size: '1.0L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Ertiga 1.5', year_from: 2019, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'MPV', transmission: 'Automatic' },
    { name: 'XL6 1.5', year_from: 2019, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'MPV', transmission: 'Automatic' },
  ],
  'Isuzu': [
    { name: 'D-Max 1.9 Ddi', year_from: 2020, engine_size: '1.9L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Manual' },
    { name: 'D-Max 3.0 Ddi', year_from: 2020, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'D-Max X-Rider', year_from: 2022, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'MU-X 1.9', year_from: 2021, engine_size: '1.9L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'MU-X 3.0', year_from: 2021, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Mitsubishi': [
    { name: 'Mirage 1.2', year_from: 2016, engine_size: '1.2L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'CVT' },
    { name: 'ASX 2.0', year_from: 2020, engine_size: '2.0L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Eclipse Cross 1.5T', year_from: 2018, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Outlander 2.5', year_from: 2022, engine_size: '2.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Outlander PHEV', year_from: 2023, engine_size: '2.4L PHEV', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Pajero Sport 2.4d', year_from: 2016, engine_size: '2.4L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Triton 2.4d', year_from: 2019, engine_size: '2.4L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'Xpander 1.5', year_from: 2022, engine_size: '1.5L', fuel_type: 'Petrol', body_type: 'MPV', transmission: 'CVT' },
  ],
  'Haval': [
    { name: 'Jolion 1.5T', year_from: 2021, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'Jolion HEV', year_from: 2022, engine_size: '1.5L Hybrid', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'DCT' },
    { name: 'H6 2.0T', year_from: 2021, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'H6 GT 2.0T', year_from: 2022, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'H6 HEV', year_from: 2023, engine_size: '1.5L Hybrid', fuel_type: 'Hybrid', body_type: 'SUV', transmission: 'DCT' },
  ],
  'GWM': [
    { name: 'P-Series 2.0T', year_from: 2021, engine_size: '2.0L Turbo', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'Steed 5 2.0 VGT', year_from: 2018, engine_size: '2.0L Diesel', fuel_type: 'Diesel', body_type: 'Bakkie', transmission: 'Manual' },
    { name: 'Ora 03 Electric', year_from: 2023, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'Tank 300', year_from: 2024, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Chery': [
    { name: 'Tiggo 4 Pro 1.5T', year_from: 2022, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Tiggo 7 Pro 1.5T', year_from: 2022, engine_size: '1.5L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Tiggo 8 Pro 2.0T', year_from: 2022, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
    { name: 'Tiggo 8 Pro Max', year_from: 2023, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DCT' },
  ],
  'BYD': [
    { name: 'Atto 3 Electric', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Dolphin Electric', year_from: 2023, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'Seal Electric', year_from: 2024, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'Shark PHEV', year_from: 2024, engine_size: '1.5L PHEV', fuel_type: 'Hybrid', body_type: 'Bakkie', transmission: 'Automatic' },
  ],
  'Land Rover': [
    { name: 'Defender 90', year_from: 2020, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Defender 110', year_from: 2020, engine_size: '3.0L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Defender V8', year_from: 2021, engine_size: '5.0L V8 Supercharged', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Discovery Sport', year_from: 2020, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Discovery', year_from: 2017, engine_size: '3.0L V6 Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Range Rover Evoque', year_from: 2019, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Range Rover Velar', year_from: 2017, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Range Rover Sport', year_from: 2022, engine_size: '3.0L V6 Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Range Rover', year_from: 2022, engine_size: '3.0L V6 Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Volvo': [
    { name: 'XC40 T4', year_from: 2018, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'XC40 Recharge', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'XC60 B5', year_from: 2021, engine_size: '2.0L Turbo + Mild Hybrid', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'XC90 B5', year_from: 2021, engine_size: '2.0L Turbo + Mild Hybrid', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'S60 B5', year_from: 2020, engine_size: '2.0L Turbo + Mild Hybrid', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'C40 Recharge', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Jeep': [
    { name: 'Renegade 1.4T', year_from: 2015, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Compass 1.4T', year_from: 2017, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Cherokee 2.0T', year_from: 2019, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Wrangler 3.6 V6', year_from: 2018, engine_size: '3.6L V6', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Wrangler Rubicon', year_from: 2018, engine_size: '3.6L V6', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Gladiator 3.6 V6', year_from: 2020, engine_size: '3.6L V6', fuel_type: 'Petrol', body_type: 'Bakkie', transmission: 'Automatic' },
    { name: 'Grand Cherokee L', year_from: 2022, engine_size: '3.6L V6', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Porsche': [
    { name: 'Macan', year_from: 2019, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'PDK' },
    { name: 'Macan S', year_from: 2019, engine_size: '2.9L V6 Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'PDK' },
    { name: 'Cayenne', year_from: 2018, engine_size: '3.0L V6 Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Cayenne S', year_from: 2018, engine_size: '2.9L V6 Twin-Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: '911 Carrera', year_from: 2019, engine_size: '3.0L Flat-6 Turbo', fuel_type: 'Petrol', body_type: 'Coupe', transmission: 'PDK' },
    { name: '911 Turbo S', year_from: 2020, engine_size: '3.8L Flat-6 Twin-Turbo', fuel_type: 'Petrol', body_type: 'Coupe', transmission: 'PDK' },
    { name: 'Taycan', year_from: 2020, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'Taycan Cross Turismo', year_from: 2021, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Estate', transmission: 'Automatic' },
  ],
  'Renault': [
    { name: 'Kwid 1.0', year_from: 2017, engine_size: '1.0L', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Triber 1.0', year_from: 2020, engine_size: '1.0L', fuel_type: 'Petrol', body_type: 'MPV', transmission: 'Manual' },
    { name: 'Kiger 1.0T', year_from: 2021, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
    { name: 'Duster 1.5 dCi', year_from: 2018, engine_size: '1.5L Diesel', fuel_type: 'Diesel', body_type: 'SUV', transmission: 'Manual' },
    { name: 'Captur 1.3T', year_from: 2020, engine_size: '1.3L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'EDC' },
    { name: 'Koleos 2.5', year_from: 2017, engine_size: '2.5L', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'CVT' },
  ],
  'Peugeot': [
    { name: '208 1.2 PureTech', year_from: 2020, engine_size: '1.2L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: 'e-208 Electric', year_from: 2020, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Hatchback', transmission: 'Automatic' },
    { name: '2008 1.2 PureTech', year_from: 2020, engine_size: '1.2L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'e-2008 Electric', year_from: 2020, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: '3008 1.6 PureTech', year_from: 2017, engine_size: '1.6L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
    { name: '5008 1.6 PureTech', year_from: 2017, engine_size: '1.6L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'Automatic' },
  ],
  'Skoda': [
    { name: 'Fabia 1.0 TSI', year_from: 2022, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'Manual' },
    { name: 'Scala 1.0 TSI', year_from: 2020, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'Hatchback', transmission: 'DSG' },
    { name: 'Octavia 1.4 TSI', year_from: 2020, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'DSG' },
    { name: 'Octavia RS', year_from: 2021, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'DSG' },
    { name: 'Kamiq 1.0 TSI', year_from: 2020, engine_size: '1.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DSG' },
    { name: 'Karoq 1.4 TSI', year_from: 2018, engine_size: '1.4L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DSG' },
    { name: 'Kodiaq 2.0 TSI', year_from: 2017, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'SUV', transmission: 'DSG' },
    { name: 'Superb 2.0 TSI', year_from: 2020, engine_size: '2.0L Turbo', fuel_type: 'Petrol', body_type: 'Sedan', transmission: 'DSG' },
  ],
  'Tesla': [
    { name: 'Model 3', year_from: 2021, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'Model 3 Long Range', year_from: 2021, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'Model Y', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Model Y Long Range', year_from: 2022, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
    { name: 'Model S', year_from: 2021, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'Sedan', transmission: 'Automatic' },
    { name: 'Model X', year_from: 2021, engine_size: 'Electric', fuel_type: 'Electric', body_type: 'SUV', transmission: 'Automatic' },
  ],
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user and their organization
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return new Response(JSON.stringify({ error: 'User not associated with an organization' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const organizationId = profile.organization_id

    // Insert makes with logos
    const makesToInsert = carMakes.map(make => ({
      ...make,
      organization_id: organizationId,
      logo_url: getLogoUrl(make.name),
    }))

    const { data: insertedMakes, error: makesError } = await supabase
      .from('car_makes')
      .upsert(makesToInsert, { onConflict: 'organization_id,name' })
      .select()

    if (makesError) {
      console.error('Error inserting makes:', makesError)
      return new Response(JSON.stringify({ error: makesError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get all makes (including existing ones)
    const { data: allMakes } = await supabase
      .from('car_makes')
      .select('id, name')
      .eq('organization_id', organizationId)

    const makeNameToId = new Map(allMakes?.map(m => [m.name, m.id]) || [])

    // Insert models
    const modelsToInsert: any[] = []
    for (const [makeName, models] of Object.entries(carModels)) {
      const makeId = makeNameToId.get(makeName)
      if (!makeId) continue
      
      for (const model of models) {
        modelsToInsert.push({
          make_id: makeId,
          organization_id: organizationId,
          name: model.name,
          year_from: model.year_from,
          year_to: model.year_to,
          engine_size: model.engine_size,
          fuel_type: model.fuel_type,
          body_type: model.body_type,
          transmission: model.transmission,
        })
      }
    }

    const { data: insertedModels, error: modelsError } = await supabase
      .from('car_models')
      .upsert(modelsToInsert, { onConflict: 'organization_id,make_id,name' })
      .select()

    if (modelsError) {
      console.error('Error inserting models:', modelsError)
      return new Response(JSON.stringify({ error: modelsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true,
      makesInserted: insertedMakes?.length || 0,
      modelsInserted: insertedModels?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
