// import { useTranslations } from "next-intl";
// import React, { useRef, useEffect, useState } from "react";
// import SignaturePad from "signature_pad";

// const SignatureComponent: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const signaturePadRef = useRef<SignaturePad | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const t = useTranslations("signaturePad");

//   useEffect(() => {
//     if (canvasRef.current) {
//       // Resize the canvas to make it responsive
//       const canvas = canvasRef.current;
//       const parentWidth = canvas.parentElement?.offsetWidth || 500;

//       canvas.width = parentWidth - 40; // Adjust canvas width
//       canvas.height = 200; // Fixed height

//       signaturePadRef.current = new SignaturePad(canvas, {
//         backgroundColor: "#ffffff", // White background
//         penColor: "#000000", // Black pen
//       });
//     }
//   }, [isModalOpen]); // Reinitialize when the modal is opened

//   // Clear the signature pad
//   const clearSignature = () => {
//     signaturePadRef.current?.clear();
//   };

//   // Close the modal
//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <div>
//       {/* Button to open the modal */}
//       <button
//         onClick={() => setIsModalOpen(true)}
//         type="button"
//         className="px-4 py-2 bg-info-dark text-white rounded hover:bg-info-light"
//       >
//         {t("open")}
//       </button>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
//             {/* Modal Header */}
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Signature Pad</h2>
//               <button
//                 onClick={closeModal}
//                 type="button"
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Canvas for Drawing */}
//             <canvas
//               ref={canvasRef}
//               className="border border-gray-300 rounded shadow w-full"
//             ></canvas>

//             {/* Buttons */}
//             <div className="flex justify-between mt-4">
//               <button
//                 onClick={clearSignature}
//                 type="button"
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//               >
//                 {t("clear")}
//               </button>
//               <button
//                 onClick={closeModal}
//                 type="button"
//                 className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//               >
//                 {t("done")}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SignatureComponent;
