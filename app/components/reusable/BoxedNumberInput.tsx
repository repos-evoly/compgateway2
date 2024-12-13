// "use client";

// import React, { useState, useRef } from "react";

// interface BoxedNumberInputProps {
//   title: string;
//   divisions: number[]; // Array defining the number of boxes in each group
//   onChange?: (value: string) => void; // Callback when the value changes
// }

// const BoxedNumberInput: React.FC<BoxedNumberInputProps> = ({
//   title,
//   divisions,
//   onChange,
// }) => {
//   const totalBoxes = divisions.reduce((sum, count) => sum + count, 0);
//   const [values, setValues] = useState<string[]>(Array(totalBoxes).fill(""));

//   // Create a ref to manage inputs in this component instance
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   const handleInputChange = (
//     index: number,
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const inputValue = event.target.value.replace(/\D/g, ""); // Allow only numeric input

//     if (inputValue.length <= 1) {
//       const updatedValues = [...values];
//       updatedValues[index] = inputValue;
//       setValues(updatedValues);

//       // Concatenate all values and send to onChange callback
//       if (onChange) {
//         onChange(updatedValues.join(""));
//       }

//       // Automatically focus the next box if current box is filled
//       if (inputValue && index < totalBoxes - 1) {
//         const nextInput = inputRefs.current[index + 1];
//         nextInput?.focus();
//       }
//     }
//   };

//   const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
//     const direction = document.documentElement.dir || "ltr"; // Get the current direction of the document
//     const isRTL = direction === "rtl";

//     if (event.key === "ArrowRight") {
//       if (isRTL && index > 0) {
//         // Move to the previous box in RTL
//         inputRefs.current[index - 1]?.focus();
//       } else if (!isRTL && index < totalBoxes - 1) {
//         // Move to the next box in LTR
//         inputRefs.current[index + 1]?.focus();
//       }
//     } else if (event.key === "ArrowLeft") {
//       if (isRTL && index < totalBoxes - 1) {
//         // Move to the next box in RTL
//         inputRefs.current[index + 1]?.focus();
//       } else if (!isRTL && index > 0) {
//         // Move to the previous box in LTR
//         inputRefs.current[index - 1]?.focus();
//       }
//     }
//   };

//   return (
//     <div className="flex items-center space-x-4 rtl:space-x-reverse">
//       {/* Title */}
//       <span className="text-gray-800 text-sm font-medium rtl:ml-2 ltr:mr-2">
//         {title}
//       </span>

//       {/* Render the boxes based on divisions */}
//       <div className="flex items-center space-x-4 rtl:space-x-reverse">
//         {divisions.map((groupSize, groupIndex) => {
//           return (
//             <div
//               key={`group-${groupIndex}`}
//               className="flex  rtl:space-x-reverse"
//             >
//               {Array.from({ length: groupSize }).map((_, boxIndex) => {
//                 const globalIndex =
//                   divisions
//                     .slice(0, groupIndex)
//                     .reduce((sum, count) => sum + count, 0) + boxIndex;

//                 return (
//                   <input
//                     key={`box-${globalIndex}`}
//                     ref={(el) => {
//                       inputRefs.current[globalIndex] = el; // Assign the input element to the ref
//                     }}
//                     type="text"
//                     inputMode="numeric"
//                     maxLength={1} // Each box accepts only one number
//                     value={values[globalIndex]} // Bind value to state
//                     onChange={(e) => handleInputChange(globalIndex, e)}
//                     onKeyDown={(e) => handleKeyDown(globalIndex, e)} // Handle arrow key navigation
//                     className="w-10 h-10 border border-gray-400  text-center text-lg focus:outline-none focus:ring focus:ring-green-500"
//                   />
//                 );
//               })}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default BoxedNumberInput;
