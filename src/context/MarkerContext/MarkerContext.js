import React, {createContext, useState, useContext} from 'react';

const MarkerContext = createContext();

export const MarkerProvider = ({children}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  return (
    <MarkerContext.Provider value={{selectedMarker, setSelectedMarker}}>
      {children}
    </MarkerContext.Provider>
  );
};

export const useMarkerContext = () => {
  return useContext(MarkerContext);
};
