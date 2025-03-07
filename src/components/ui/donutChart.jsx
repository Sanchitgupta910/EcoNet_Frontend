// import React, { useState } from 'react';
// import { Doughnut } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

// ChartJS.register(ArcElement, Tooltip, Legend);

// const getOptions = (onHover) => ({
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       display: false,
//     },
//     tooltip: {
//       enabled: false,
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
//     onHover: onHover,
//   },
// });

// export default function DonutChart({ title, description, data }) {
//   const [hidden, setHidden] = useState({});
//   const [tooltip, setTooltip] = useState({ active: false, payload: [] });

//   const handleLegendClick = (index) => {
//     setHidden((prev) => ({
//       ...prev,
//       [index]: !prev[index],
//     }));
//   };

//   const legendItems = data.labels.map((label, index) => ({
//     label,
//     color: data.datasets[0].backgroundColor[index],
//     value: label,
//     index,
//     hidden: !!hidden[index],
//   }));

//   const chartData = {
//     ...data,
//     datasets: data.datasets.map((dataset) => ({
//       ...dataset,
//       data: dataset.data.map((val, index) => (hidden[index] ? 0 : val)),
//     })),
//   };

//   const onHover = (event, chartElements) => {
//     if (chartElements.length) {
//       setTooltip({ active: true, payload: chartElements });
//       event.native.target.style.cursor = 'pointer';
//     } else {
//       setTooltip({ active: false, payload: [] });
//       event.native.target.style.cursor = 'default';
//     }
//   };

//   return (
//     <Card className="h-[400px]">
//       <CardHeader>
//         <CardTitle className="text-lg font-medium">{title}</CardTitle>
//         <p className="text-sm text-muted-foreground">{description}</p>
//       </CardHeader>
//       <CardContent className="relative">
//         <ChartContainer>
//           <div className="flex flex-row h-[300px] w-full">
//             <div className="relative w-2/3 h-full">
//               <Doughnut data={chartData} options={getOptions(onHover)} />
//               <div className="absolute inset-0 flex flex-col items-center justify-center">
//                 <span className="text-3xl font-bold">{data.totalWeight.toFixed(2)}</span>
//                 <span className="text-sm text-gray-500">Total Waste (Kgs)</span>
//               </div>
//             </div>
//             <div className="w-1/3 h-full flex items-center justify-center">
//               <ChartLegendContent payload={legendItems} onLegendClick={handleLegendClick} />
//             </div>
//           </div>
//           {tooltip.active && (
//             <ChartTooltip
//               content={
//                 <ChartTooltipContent
//                   active={tooltip.active}
//                   payload={tooltip.payload.map((el) => ({
//                     name: el.label,
//                     value: el.formattedValue,
//                     color: el.element.options.backgroundColor,
//                   }))}
//                 />
//               }
//             />
//           )}
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }

import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/Chart";

ChartJS.register(ArcElement, Tooltip, Legend);

const getOptions = (onHover) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  cutout: "70%",
  animation: {
    animateRotate: true,
    animateScale: true,
  },
  hover: {
    mode: "nearest",
    intersect: true,
    onHover: onHover,
  },
});

export default function DonutChart({ title, description, data }) {
  const [hidden, setHidden] = useState({});
  const [tooltip, setTooltip] = useState({ active: false, payload: null });

  const handleLegendClick = (index) => {
    setHidden((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const legendItems = data.labels.map((label, index) => ({
    label,
    color: data.datasets[0].backgroundColor[index],
    value: label,
    index,
    hidden: !!hidden[index],
  }));

  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.map((val, index) => (hidden[index] ? 0 : val)),
    })),
  };

  const onHover = (event, elements) => {
    if (elements && elements.length > 0) {
      const dataIndex = elements[0].index;
      setTooltip({
        active: true,
        payload: {
          label: data.labels[dataIndex],
          value: data.datasets[0].data[dataIndex],
          color: data.datasets[0].backgroundColor[dataIndex],
        },
      });
    } else {
      setTooltip({ active: false, payload: null });
    }
  };

  return (
    <Card className="h-[450px]">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="relative">
        <ChartContainer className="h-[300px]">
          <div className="flex flex-row h-full w-full">
            <div className="relative w-2/3 h-full">
              <Doughnut data={chartData} options={getOptions(onHover)} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">
                  {data.totalWeight.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">Total Waste (Kgs)</span>
              </div>
            </div>
            <div className="w-1/3 h-full flex items-center justify-center">
              <ChartLegendContent
                payload={legendItems}
                onLegendClick={handleLegendClick}
              />
            </div>
          </div>
          {tooltip.active && tooltip.payload && (
            <ChartTooltip
              content={
                <ChartTooltipContent
                  active={tooltip.active}
                  payload={[
                    {
                      name: tooltip.payload.label,
                      value: tooltip.payload.value.toFixed(2),
                      color: tooltip.payload.color,
                    },
                  ]}
                />
              }
            />
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
