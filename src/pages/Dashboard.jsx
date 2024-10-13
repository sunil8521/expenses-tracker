import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import Error500 from "../comp/Error500";
import LoadingPage from "../comp/LoadingPage";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Nav from "../comp/Nav";
import useFetchUserData from "../hooks/Fetchdata";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Dashboard = () => {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );

  const { transactions, loading, error } = useFetchUserData();



  const expensesByMonth = transactions.reduce((acc, transaction) => {
    if (transaction.type === "expense") {
      const transactionMonth = new Date(transaction.date).toLocaleString(
        "default",
        { month: "long" }
      );
      if (!acc[transactionMonth]) {
        acc[transactionMonth] = 0;
      }
      acc[transactionMonth] += transaction.amount;
    }
    return acc;
  }, {});
  
  const expensesByMonthArray = Object.keys(expensesByMonth).map((month) => ({
    month,
    amount: expensesByMonth[month],
  }));
  


  // Filter transactions by selected month and type "expense"
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionMonth = new Date(transaction.date).toLocaleString(
      "default",
      { month: "long" }
      
    );
    return transactionMonth === selectedMonth && transaction.type === "expense";
  });

  // Group transactions by category and sum their amounts
  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    if (!acc[category]) {
      acc[category] = { category, amount: 0 };
    }
    acc[category].amount += amount;
    return acc;
  }, {});

  // Convert the grouped object into an array for easier handling
  const groupedTransactionsArray = Object.values(groupedTransactions);

  // Calculate the total expenses
  const totalExpenses = groupedTransactionsArray.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const pieChartData = {
    labels: groupedTransactionsArray.map((transaction) => transaction.category),
    datasets: [
      {
        data: groupedTransactionsArray.map((transaction) => transaction.amount),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
        ],
      },
    ],
  };

  // const barChartData = {
  //   labels: groupedTransactionsArray.map((transaction) => transaction.category),
  //   datasets: [
  //     {
  //       label: "Expenses",
  //       data: groupedTransactionsArray.map((transaction) => transaction.amount),
  //       backgroundColor: "#36A2EB",
  //     },
  //   ],
  // };



  const barChartData = {
    labels: expensesByMonthArray.map((data) => data.month),
    datasets: [
      {
        label: "Expenses",
        data: expensesByMonthArray.map((data) => data.amount),
        backgroundColor: "#36A2EB",
      },
    ],
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Expenses by Category",
      },
    },
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <Error500 />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white p-4 shadow flex justify-between items-center sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="w-6" />
      </header>

      <ScrollArea className="flex-1">
        <main className="p-4 space-y-6 pb-20">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-4 text-2xl font-bold">
                Total Expenses: ₹{totalExpenses}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <Pie
                  data={pieChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <Bar options={barChartOptions} data={barChartData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {groupedTransactionsArray
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((transaction, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>{transaction.category}</span>
                      <span className="font-semibold">
                      ₹{transaction.amount}
                      </span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </main>
      </ScrollArea>

      <Nav />
    </div>
  );
};

export default Dashboard;
