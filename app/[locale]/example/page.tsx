// /* --------------------------------------------------------------------------
//    app/login-iframe/page.tsx
//    – Utility page that embeds the real login screen in an <iframe>.
//    Use it to verify that your anti-framing / X-Frame-Options headers
//    block the content (expected outcome: blank frame or browser error).
// -------------------------------------------------------------------------- */
// "use client";

// import React from "react";

// /* ---------- constants ---------- */
// const LOGIN_PATH = "/auth/login"; // adjust if your route differs

// /* ---------- component ---------- */
// export default function LoginIframePage(): JSX.Element {
//   return (
//     <div className="h-screen w-screen flex items-center justify-center bg-gray-100 p-4">
//       <iframe
//         src={LOGIN_PATH}
//         title="Login Page Iframe Test"
//         className="w-full max-w-2xl h-[80vh] border-2 border-gray-300 rounded-lg"
//         /* remove sandbox if you want to test headers only */
//         sandbox="allow-same-origin allow-scripts allow-forms"
//       />
//     </div>
//   );
// }

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;
