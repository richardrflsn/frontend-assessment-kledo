interface District {
  id: number;
  name: string;
  regency_id: number;
}

interface Province {
  id: number;
  name: string;
}

interface Regency {
  id: number;
  name: string;
  province_id: number;
}

export interface FilterDataStructure {
  districts: District[];
  provinces: Province[];
  regencies: Regency[];
}
