// import React from "react";
// import { useSelector } from "react-redux";
// import Header from "./header";

// const Layout = ({ children }) => {
//   const { authUser } = useSelector((state) => state.auth);
//   const { theme } = useSelector((state) => state.theme);

//   return (
//     <main className={theme === "dark" && "dark"}>
//       <section className="min-h-screen dark:bg-gray-seven">
//         <Header />
//       </section>

//       <section className={authUser && "wrapper relative"}>
//         {/* {authUser && <Sidebar />} */}
//         <section className={`py-2 ${authUser && "1000:ml-[200px] 1000:pl-7 "}`}>
//           {children}
//         </section>
//       </section>
//     </main>
//   );
// };

// export default Layout;
