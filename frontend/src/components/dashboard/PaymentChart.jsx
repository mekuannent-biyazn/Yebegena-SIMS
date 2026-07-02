import { Doughnut } from "react-chartjs-2";

import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

import Card from "../common/Card";

Chart.register(ArcElement, Tooltip, Legend);

const PaymentChart = ({ payments }) => {
  const data = {
    labels: payments.map((p) => p._id),

    datasets: [
      {
        data: payments.map((p) => p.total),
      },
    ],
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Payment Overview</h2>

      <Doughnut data={data} />
    </Card>
  );
};

export default PaymentChart;
