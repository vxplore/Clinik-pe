// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Paper,
//   Button,
//   Badge,
//   Table,
//   Text,
//   Anchor,
//   Loader,
// } from "@mantine/core";
// import { IconArrowLeft } from "@tabler/icons-react";
// import apis from "../../../APis/Api";
// import useAuthStore from "../../../GlobalStore/store";
// import type { OtherTestPanelRow } from "../../../APis/Types";

// const OtherTestPanelDetails: React.FC = () => {
//   const navigate = useNavigate();
//   const { panelId } = useParams<{ panelId: string }>();
//   const [panel, setPanel] = useState<OtherTestPanelRow | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const organizationDetails = useAuthStore((s) => s.organizationDetails);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         // @ts-expect-error: allow GetOtherTestPanelById
//         const resp = await apis.GetOtherTestPanelById(
//           organizationDetails?.organization_id ?? "",
//           organizationDetails?.center_id ?? "",
//           panelId ?? ""
//         );
//         // @ts-expect-error: allow data.panel
//         if (mounted && resp?.data?.panel) {
//           // @ts-expect-error: allow data.panel
//           const p = resp.data.panel;
//           const mapped: OtherTestPanelRow = {
//             id: p.id,
//             uid: p.id,
//             name: p.name,
//             description: p.description || "",
//             department: p.department || "",
//             price: p.price,
//             status: p.status,
//             data: p.data,
//             tests: (p.tests || []).map((t: any) =>
//               typeof t === "string" ? t : t.name || t.test_name
//             ),
//           };
//           setPanel(mapped);
//         }
//       } catch (err) {
//         console.error("GetOtherTestPanelById failed:", err);
//         setError("Failed to load test panel details");
//       } finally {
//         setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [
//     organizationDetails?.organization_id,
//     organizationDetails?.center_id,
//     panelId,
//   ]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <Loader />
//       </div>
//     );
//   }

//   if (error || !panel) {
//     return (
//       <div className="p-6">
//         <Anchor
//           component="button"
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline mb-4"
//         >
//           <IconArrowLeft size={16} />
//           <Text size="sm" fw={600} className="font-medium">
//             Back
//           </Text>
//         </Anchor>
//         <div className="text-red-600">{error || "Panel not found"}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-0">
//       <Anchor
//         component="button"
//         onClick={() => navigate(-1)}
//         className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline mb-4"
//       >
//         <IconArrowLeft size={16} />
//         <Text size="sm" fw={600} className="font-medium">
//           Back to Radiology Test Panels
//         </Text>
//       </Anchor>

//       <div className="mb-6">
//         <h2 className="text-2xl font-semibold">{panel.name}</h2>
//         <p className="text-sm text-gray-600 mt-1">{panel.description}</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <Paper withBorder radius="md" className="p-4">
//           <div className="mb-3">
//             <Text size="xs" className="text-gray-500 uppercase tracking-wide">
//               Department
//             </Text>
//             <Text size="lg" fw={600} className="text-gray-900">
//               {panel.department}
//             </Text>
//           </div>
//         </Paper>

//         <Paper withBorder radius="md" className="p-4">
//           <div className="mb-3">
//             <Text size="xs" className="text-gray-500 uppercase tracking-wide">
//               Price
//             </Text>
//             <Text size="lg" fw={600} className="text-gray-900">
//               {panel.price}
//             </Text>
//           </div>
//         </Paper>

//         <Paper withBorder radius="md" className="p-4">
//           <div className="mb-3">
//             <Text size="xs" className="text-gray-500 uppercase tracking-wide">
//               Status
//             </Text>
//             <Badge
//               color={panel.status === "active" ? "green" : "red"}
//               className="mt-1"
//             >
//               {panel.status}
//             </Badge>
//           </div>
//         </Paper>

//         {/* Order removed to show only the required fields: name, description, price, status, data, department, tests[] */}
//       </div>

//       {panel.data && (
//         <Paper withBorder radius="md" className="p-4 mb-6">
//           <div className="mb-3">
//             <Text size="xs" className="text-gray-500 uppercase tracking-wide">
//               Data
//             </Text>
//             <Text size="sm" className="text-gray-700 whitespace-pre-wrap mt-2">
//               {panel.data}
//             </Text>
//           </div>
//         </Paper>
//       )}

//       <Paper withBorder radius="md" className="p-4 mb-6">
//         <div className="mb-4">
//           <Text
//             size="sm"
//             fw={600}
//             className="text-gray-900 uppercase tracking-wide"
//           >
//             Tests ({panel.tests.length})
//           </Text>
//         </div>

//         {panel.tests.length > 0 ? (
//           <div className="overflow-x-auto">
//             <Table striped highlightOnHover>
//               <Table.Tbody>
//                 {panel.tests.map((test, idx) => (
//                   <Table.Tr key={idx}>
//                     <Table.Td className="text-sm text-gray-600">
//                       {idx + 1}.
//                     </Table.Td>
//                     <Table.Td className="text-sm text-gray-900 font-medium">
//                       {test}
//                     </Table.Td>
//                   </Table.Tr>
//                 ))}
//               </Table.Tbody>
//             </Table>
//           </div>
//         ) : (
//           <Text size="sm" className="text-gray-500">
//             No tests assigned
//           </Text>
//         )}
//       </Paper>

//       <div className="flex gap-2">
//         <Button
//           onClick={() =>
//             navigate("/radiology/test-panels/edit", { state: { row: panel } })
//           }
//           variant="filled"
//           color="blue"
//         >
//           Edit Panel
//         </Button>
//         <Button onClick={() => navigate(-1)} variant="default">
//           Back
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default OtherTestPanelDetails;
