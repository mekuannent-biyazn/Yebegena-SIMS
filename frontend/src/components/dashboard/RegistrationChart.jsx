import { Bar } from "react-chartjs-2";

import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import Card from "../common/Card";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const RegistrationChart = ({ registrations }) => {
  const labels = registrations.map(
    (item) => `${item._id.month}/${item._id.year}`,
  );

  const data = {
    labels,

    datasets: [
      {
        label: "Students",

        data: registrations.map((item) => item.total),
      },
    ],
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Monthly Registration</h2>

      <Bar data={data} />
    </Card>
  );
};

export default RegistrationChart;
