import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow} from '@react-google-maps/api';
import { getHutsDetail } from '../services/hut';
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from 'react-router-dom';

const key_api_maps = import.meta.env.VITE_CLAVE_API_GOOGLE_MAPS

export const Map = () => {
  const [selectedHut, setSelectedHut] = useState(null);
  const [center, setCenter] = useState({ lat: 41.3851, lng: 2.1734 });
  const [mounted, setMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false);

  const { store, dispatch } = useGlobalReducer();
  const huts = store.hutsDetail

  // ==================== DEBUG MEJORADO ====================
  useEffect(() => {
    console.log('🔍 Total de cabañas:', huts);
    if (huts.length > 0) {
      huts.forEach((hut, index) => {
        console.log(`🔍 Cabaña ${index}:`, hut.name);
        console.log(`   location_to:`, hut.location_to);
        if (hut.location_to) {
          console.log(`   position:`, hut.location_to.position);
          console.log(`   lat:`, hut.location_to.position?.lat, `lng:`, hut.location_to.position?.lng);
        }
      });
    }
  }, [huts]);

  const mapStyles = {
    height: "70vh",
    width: "100%",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  };

  useEffect(() => {
    const getHuts = async () => {
      try {
        const HutsData = await getHutsDetail();
        dispatch({ type: "hutsDetail", payload: HutsData });
      } catch (error) {
        console.error("Error fetching huts:", error);
      }
    };

    getHuts();
    setMounted(true)
  }, []);

  // ==================== FILTRADO MEJORADO ====================
  const hutsWithValidLocation = huts.filter(hut => {
    if (!hut.location_to) {
      console.log(`❌ Cabaña "${hut.name}" no tiene location_to`);
      return false;
    }
    
    const position = hut.location_to.position;
    const hasValidCoords = position && position.lat && position.lng;
    
    if (!hasValidCoords) {
      console.log(`❌ Cabaña "${hut.name}" tiene coordenadas inválidas:`, position);
    } else {
      console.log(`✅ Cabaña "${hut.name}" tiene coordenadas válidas:`, position);
    }
    
    return hasValidCoords;
  });

  console.log('📍 Cabañas con ubicación válida:', hutsWithValidLocation.length);

  const handleOnClickHut = (item) => {
    setSelectedHut(item)
  }

  if (!mounted) {
    return (<div> Cargando ... </div>)
  }

  return (
    <LoadScript
      googleMapsApiKey={key_api_maps}
      libraries={['places']}
      onLoad={() => {
        console.log('✅ Google Maps cargado');
        setIsLoaded(true);
      }}
      onError={(error) => console.error('❌ Error cargando Google Maps:', error)}
    >
      <GoogleMap 
        mapContainerStyle={mapStyles} 
        zoom={10} 
        center={center}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        }}
      >
        {hutsWithValidLocation.map(hut => (
          <Marker
            key={hut.id}
            position={hut.location_to.position}
            onClick={() => handleOnClickHut(hut)}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/lodging.png",
              scaledSize: new window.google.maps.Size(40, 40),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(20, 20)
            }}
          />
        ))}
      
        {selectedHut && selectedHut.location_to && (
          <InfoWindow 
            position={selectedHut.location_to.position}
            onCloseClick={() => setSelectedHut(null)}
          >
            <div className="w-64 bg-white rounded-lg overflow-hidden shadow-xl">
              <div className="p-2">
                <div className="bg-green-350 p-3">
                  <h3 className="font-bold text-white text-lg">{selectedHut.name}</h3>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">${selectedHut.price_per_night}/noche</span>
                  </div>
                </div>
                <img
                  src={selectedHut.image_url}
                  alt={selectedHut.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <Link
                  to={`/huts/${selectedHut.id}`}
                  className="block w-full text-center bg-green-350 hover:bg-green-550 text-white py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>  
  );
};