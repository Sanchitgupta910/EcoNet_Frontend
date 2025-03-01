// import React from 'react';
// import { Doughnut } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

// ChartJS.register(ArcElement, Tooltip, Legend);

// const options = {
//   responsive: true,
//   maintainAspectRatio: true,
//   plugins: {
//     legend: {
//       display: true,
//     },
//     tooltip: {
//       enabled: true,
//     },
//   },
//   cutout: '70%',
//   animation: {
//     animateRotate: true,
//     animateScale: true,
//   },
//   hover: {
//     mode: 'nearest',
//     intersect: true,
//     onHover: (event, chartElement) => {
//       if (chartElement.length) {
//         event.native.target.style.cursor = 'pointer';
//         chartElement[0].element.outerRadius += 20;
//       } else {
//         event.native.target.style.cursor = 'default';
//       }
//     }
//   },
// };

// export default function DonutChart({ title, data }) {
//   const config = data.labels.reduce((acc, label, index) => {
//     acc[label] = {
//       label,
//       color: data.datasets[0].backgroundColor[index],
//     };
//     return acc;
//   }, {});

//   return (
//     <Card className="h-[400px]">
//       <CardHeader>
//         <CardTitle className="text-lg font-medium">{title}</CardTitle>
//       </CardHeader>
//       <CardContent className="relative flex flex-col items-center justify-center">
//         <ChartContainer config={config} className="h-[300px] w-full">
//           <div className="relative w-full h-[240px]">
//             <Doughnut data={data} options={options} />
//             <div className="absolute inset-0 flex flex-col items-center justify-center">
//               <span className="text-3xl font-bold">{data.totalWeight.toFixed(2)}</span>
//               <span className="text-sm text-gray-500">Total Waste (Kgs)</span>
//             </div>
//           </div>
//           <ChartTooltip content={<ChartTooltipContent />} />
//           <div className="mt-4">
//             <ChartLegend content={<ChartLegendContent />} />
//           </div>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

ChartJS.register(ArcElement, Tooltip, Legend);

// Create a function that returns options so we can inject our custom onHover.
const getOptions = (onHover) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // Disable built-in legend and tooltip since we are using custom ones.
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    cutout: '70%',
    animation: {
      animateRotate: true,
      animateScale: true,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
      onHover: onHover,
    },
  });
  
  export default function DonutChart({ title, data }) {
    // State to control which legend items (and thus segments) are hidden.
    const [hidden, setHidden] = React.useState({});
    // State for tooltip information.
    const [tooltip, setTooltip] = React.useState({ active: false, payload: [] });
  
    // Toggle a legend item when clicked.
    const handleLegendClick = (index) => {
      setHidden((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };
  
    // Compute legend items with hidden flag and index.
    const legendItems = data.labels.map((label, index) => ({
      label,
      color: data.datasets[0].backgroundColor[index],
      value: label, // unique key
      index,
      hidden: !!hidden[index],
    }));
  
    // Modify chart data: if an index is hidden, set its value to 0.
    const chartData = {
      ...data,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.map((val, index) => (hidden[index] ? 0 : val)),
      })),
    };
  
    // Custom onHover function to update tooltip state.
    const onHover = (event, chartElements) => {
      if (chartElements.length) {
        setTooltip({ active: true, payload: chartElements });
        event.native.target.style.cursor = 'pointer';
      } else {
        setTooltip({ active: false, payload: [] });
        event.native.target.style.cursor = 'default';
      }
    };

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <ChartContainer>
          <div className="flex flex-row h-[300px] w-full">
            {/* Donut Chart */}
            <div className="relative w-2/3 h-full">
              <Doughnut data={data} options={getOptions(onHover)} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{data.totalWeight.toFixed(2)}</span>
                <span className="text-sm text-gray-500">Total Waste (Kgs)</span>
              </div>
            </div>
            {/* Render Legend Directly */}
            <div className="w-1/3 h-full flex items-center justify-center">
              <ChartLegendContent payload={legendItems} />
            </div>
          </div>
          <ChartTooltip content={<ChartTooltipContent />} />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

