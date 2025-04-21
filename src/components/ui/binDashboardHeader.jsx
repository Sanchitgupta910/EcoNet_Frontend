import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from './Button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';
import { Bell, LogOut, RefreshCw } from 'lucide-react';
import NetNada_logo from '../../assets/NetNada_logo.png';

// export default function Header({
//   companyLogo,
//   companyName,
//   branchAddress = {}, // default to an empty object
//   lastUpdate,
//   onLogout,
//   onRefresh,
//   showBack = false,
//   onBack,
// }) {
//   const location = useLocation();
//   const { address = 'Branch Address', city = '', country = '' } = branchAddress;

//   return (
//     <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-3 px-4 shadow-sm">
//       <div className="container mx-auto flex items-center justify-between">
//         <div className="flex items-center">
//           <img src={companyLogo || NetNada_logo} alt="Company Logo" className="h-8" />
//           <div className="ml-3 border-l border-gray-200 pl-3">
//             <h1 className="text-sm font-medium text-gray-800">{companyName}</h1>
//             <p className="text-xs text-gray-500">
//               {address}, {city}, {country}
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           {!showBack && (
//             <>
//               <div className="flex items-center text-xs text-gray-500 mr-2">
//                 <RefreshCw className="h-3 w-3 mr-1" />
//                 <button onClick={onRefresh}>Updated: {lastUpdate}</button>
//               </div>
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" className="h-8 w-8">
//                       <Bell className="h-4 w-4 text-gray-600" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>Notifications</TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </>
//           )}
//           {showBack && (
//             <Button variant="outline" size="sm" onClick={onBack}>
//               ← Back
//             </Button>
//           )}
//           <Button variant="outline" size="sm" onClick={onLogout}>
//             <LogOut className="h-3 w-3 mr-1" />
//             Logout
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// }
export default function Header({
  companyLogo,
  companyName,
  branchAddress = {},
  lastUpdate,
  onRefresh,
  onLogout,
  showBack = false,
  onBack,
}) {
  const { address = 'Branch Address', city = '', country = '' } = branchAddress;

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-3 px-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <img src={companyLogo || NetNada_logo} alt="Company Logo" className="h-8" />
          <div className="ml-3 border-l border-gray-200 pl-3">
            <h1 className="text-sm font-medium text-gray-800">{companyName}</h1>
            <p className="text-xs text-gray-500">
              {address}, {city}, {country}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showBack ? (
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Back to Admin Dashboard
            </Button>
          ) : (
            <>
              <div className="flex items-center text-xs text-gray-500 mr-2">
                <RefreshCw className="h-3 w-3 mr-1" />
                <button onClick={onRefresh}>Updated: {lastUpdate}</button>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Bell className="h-4 w-4 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
