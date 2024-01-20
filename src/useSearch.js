import { useState, useMemo } from 'react';

const useSearch = (data) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }

    if (!searchTerm) {
      return data;
    }

    return data.filter((occasion) =>
      occasion.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  return { searchTerm, handleSearchChange, filteredOccasions: filteredData }; // Rename to filteredOccasions
};

export default useSearch;
