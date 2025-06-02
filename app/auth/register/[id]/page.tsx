// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import RegisterForm from "../components/RegisterForm"; // Adjust the import path
// import type { TKycResponse } from "../types";

// /**
//  * Example parent page that calls RegisterForm.
//  * You might fetch or have KYC data from an API, or pass it as a prop, etc.
//  */
// export default function SingleCompanyRegisterPage() {
//   const router = useRouter();

//   // Example "kycData" that you might have fetched or derived
//   // In a real scenario, you could fetch it from your API or read from route params, etc.
//   const kycData: TKycResponse["data"] = {
//     companyId: "123456",
//     branchId: "789",
//     legalCompanyName: "My Company",
//     legalCompanyNameLT: "MyCompany (En)",
//     mobile: "0555555555",
//     nationality: "Saudi",
//     city: "Riyadh",
//   };

//   // The parent's handleSubmit => for now just console.log
//   const handleSubmit = (values: any) => {
//     console.log("Received form values in the [id]/page:", values);
//     // For example, you could do real logic here
//   };

//   return (
//     <div className="w-full">
//       <h1 className="text-xl font-bold p-4">
//         ID Page / Single Company Register
//       </h1>

//       {/* If you have no KYC => fallback here, or pass an empty object, etc. */}
//       <RegisterForm kycData={kycData} onSubmit={handleSubmit} />
//     </div>
//   );
// }
import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;
