export type GeographyState = "Delhi NCR" | "Uttar Pradesh" | "Bihar";

export type City =
  | "Delhi"
  | "Prayagraj"
  | "Banaras"
  | "Lucknow"
  | "Gaya"
  | "Muzaffarpur";

export type DonorType = "National" | "International" | "CSR" | "HNI";

export type DonorPreference = {
  programId: string;
  weight: number;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  joiningDate: string;
  monthlySalary: number;
  pfContribution: number;
  tdsDeduction: number;
  geography: GeographyState;
  city: City;
  programId: string;
  photoUrl: string;
};

export type Donor = {
  id: string;
  name: string;
  type: DonorType;
  contributionAmount: number;
  adminOverheadPercent: number;
  fcraApproved: boolean;
  preferences: DonorPreference[];
};

export type Program = {
  id: string;
  name: string;
  description: string;
  geography: GeographyState;
  cities: City[];
};
