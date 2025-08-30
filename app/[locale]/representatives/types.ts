export type Representative = {
  id?: number;                 // ← new  (always present in GET /:id)
  name: string;
  number: string;
  passportNumber: string;
  isActive: boolean;
  photoUrl?: string;          // ← was already there
  createdAt?: string;          // ← new  (returned by the API)
  updatedAt?: string;          // ← new  (returned by the API)
};



export type RepresentativeListItem = {
  id: number;
  name: string;
  number: string;
  passportNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RepresentativesResponse = {
  data: RepresentativeListItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export type CreateRepresentativeRequest = {
  name: string;
  number: string;
  passportNumber: string;
  isActive: boolean;
}

export type UpdateRepresentativeRequest = {
  name: string;
  number: string;
  passportNumber: string;
  isActive: boolean;
}

export type RepresentativeFormValues = {
  name: string;
  number: string;
  passportNumber: string;
  isActive: boolean;
  photo?: File[];
} 