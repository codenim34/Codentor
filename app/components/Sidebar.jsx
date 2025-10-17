// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import {
//   FaChevronDown,
//   FaCodepen,
//   FaComments,
//   FaQuestionCircle,
//   FaTrophy,
// } from "react-icons/fa";
// import { MdAddBox, MdNotifications } from "react-icons/md";
// import { SiGoogleclassroom } from "react-icons/si";
// import {
//   TbLayoutDashboardFilled,
//   TbLayoutSidebarLeftCollapseFilled,
//   TbLayoutSidebarLeftExpandFilled,
// } from "react-icons/tb";
// import { FiMap, FiHelpCircle } from "react-icons/fi";
// import { Code2, Sparkles, MessageSquare, StickyNote, CheckSquare } from "lucide-react";

// const Sidebar = ({ isOpen, setIsOpen }) => {
//   const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 768) {
//         // desktop breakpoint
//         setIsOpen(true);
//       } else {
//         setIsOpen(false);
//       }
//     };

//     // Set initial state
//     handleResize();

//     // Add event listener
//     window.addEventListener("resize", handleResize);

//     // Cleanup
//     return () => window.removeEventListener("resize", handleResize);
//   }, [setIsOpen]);

//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   const toggleSubMenu = () => {
//     setIsSubMenuOpen(!isSubMenuOpen);
//   };

//   return (
//     <div className="flex flex-row">
//       <div
//         className={`fixed top-20 left-0 h-full bg-gradient-to-b from-black via-gray-900 to-emerald-950 z-50 shadow-2xl border-r border-emerald-800/30 transition-all duration-300 ${
//           isOpen ? "w-56" : "w-14"
//         }`}
//       >
//         <nav className={`flex flex-col ${isOpen ? "p-4 pr-12 space-y-2" : "px-2 pt-14 space-y-6"}`}>
//           {/* Main Navigation */}
//           <div className={`${isOpen ? "space-y-2 pb-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/dashboard"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Dashboard"
//             >
//               <TbLayoutDashboardFilled className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     Dashboard
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Dashboard"}
//               </span>
//             </Link>
//           </div>

//           {/* Learn Hub Section */}
//           <div className={`${isOpen ? "space-y-2 py-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/learn"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Learn Hub"
//             >
//               <SiGoogleclassroom className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     Learn Hub
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Learn Hub"}
//               </span>
//             </Link>
//           </div>

//           {/* Feed Section */}
//           <div className={`${isOpen ? "space-y-2 py-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/feed"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Feed"
//             >
//               <MessageSquare className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     Feed
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Feed"}
//               </span>
//             </Link>
//           </div>

//           {/* Connections Section */}
//           <div className={`${isOpen ? "space-y-2 py-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/connections"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Connections"
//             >
//               <FaComments className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     Connections
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Connections"}
//               </span>
//             </Link>
//           </div>

//           {/* Codelab Section */}
//           <div className={`${isOpen ? "space-y-2 py-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/codelab"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="CodeLab"
//             >
//               <Code2 className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     CodeLab
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "CodeLab"}
//               </span>
//             </Link>
//           </div>

//           {/* Interviews Section */}
//           <div className={`${isOpen ? "space-y-2 py-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/interview"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Interviews"
//             >
//               <MessageSquare className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     Interviews
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Interviews"}
//               </span>
//             </Link>
//           </div>

//           {/* Task Manager Section */}
//           <div className={`${isOpen ? "space-y-2 py-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/tasks"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Task Manager"
//             >
//               <CheckSquare className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     Task Manager
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Task Manager"}
//               </span>
//             </Link>
//           </div>

//           {/* Notes Section */}
//           <div className={`${isOpen ? "space-y-2 py-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/notes"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Notes"
//             >
//               <StickyNote className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     Notes
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Notes"}
//               </span>
//             </Link>
//           </div>

//           {/* Achievement Section */}
//           <div className={`${isOpen ? "space-y-2 py-4 border-b border-emerald-800/30" : "space-y-6"}`}>
//             <Link
//               href="/quests"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Quests"
//             >
//               <FaTrophy className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium">
//                     Quests
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Quests"}
//               </span>
//             </Link>
//           </div>

//           {/* Help Section */}
//           <div className={`${isOpen ? "space-y-2 pt-4" : "space-y-6"}`}>
//             <Link
//               href="/faq"
//               className={`flex items-center text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg ${
//                 !isOpen ? "p-1.5 justify-center" : "p-2"
//               } transition-all duration-300 relative group border border-transparent hover:border-emerald-800/30`}
//               title="Help & FAQ"
//             >
//               <FiHelpCircle className={`transition-all duration-300 min-w-[24px] min-h-[24px] ${isOpen ? "mr-2 text-xl" : "text-2xl"}`} />
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all duration-300 origin-left z-50">
//                   <div className="bg-black border border-emerald-800/50 text-gray-200 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] font-medium whitespace-nowrap">
//                     Help & FAQ
//                   </div>
//                 </div>
//               )}
//               <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
//                 {isOpen && "Help & FAQ"}
//               </span>
//             </Link>
//           </div>
//         </nav>

//         <div className="absolute right-2 top-2">
//           {!isOpen ? (
//             <button
//               onClick={toggleSidebar}
//               className="text-emerald-400 hover:text-emerald-300 rounded-lg p-0.5 hover:bg-emerald-950/50 transition-all"
//             >
//               <TbLayoutSidebarLeftExpandFilled className="text-2xl min-w-[24px] min-h-[24px]" />
//             </button>
//           ) : (
//             <button
//               onClick={toggleSidebar}
//               className="text-emerald-400 hover:text-emerald-300 rounded-lg p-0.5 hover:bg-emerald-950/50 transition-all"
//             >
//               <TbLayoutSidebarLeftCollapseFilled className="text-2xl min-w-[24px] min-h-[24px]" />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
