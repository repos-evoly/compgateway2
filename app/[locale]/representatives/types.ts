export type Representative = {
  id: number;
  name: string;
  number: string;
  passportNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RepresentativesResponse = {
  data: Representative[];
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
  id: number;
  name: string;
  number: string;
  passportNumber: string;
  isActive: boolean;
}

export type RepresentativeFormValues = {
  id?: number;
  name: string;
  number: string;
  passportNumber: string;
  isActive: boolean;
} 