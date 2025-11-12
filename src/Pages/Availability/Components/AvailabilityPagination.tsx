// import React from "react";

// type Props = {
//   page: number;
//   pageCount: number;
//   onChange: (p: number) => void;
// };

// const AvailabilityPagination: React.FC<Props> = ({
//   page,
//   pageCount,
//   onChange,
// }) => {
//   return (
//     <div className="flex items-center justify-end mt-4 gap-2">
//       <button
//         className="px-3 py-1 border rounded text-gray-600"
//         disabled={page === 1}
//         onClick={() => onChange(page - 1)}
//       >
//         Previous
//       </button>

//       <div className="inline-flex items-center gap-1">
//         {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
//           <button
//             key={n}
//             onClick={() => onChange(n)}
//             className={`w-8 h-8 rounded ${
//               page === n ? "bg-blue-600 text-white" : "border text-gray-600"
//             }`}
//           >
//             {n}
//           </button>
//         ))}
//       </div>

//       <button
//         className="px-3 py-1 border rounded text-gray-600"
//         disabled={page === pageCount}
//         onClick={() => onChange(page + 1)}
//       >
//         Next
//       </button>
//     </div>
//   );
// };

// export default AvailabilityPagination;
