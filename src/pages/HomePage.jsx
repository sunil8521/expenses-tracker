import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import Error500 from "../comp/Error500";
import LoadingPage from "../comp/LoadingPage";
import {
  PlusCircle,
  MinusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  PieChart,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import moment from "moment";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOut } from "firebase/auth";
import { googleAuth, provider, db } from "@/firebase/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Nav from "../comp/Nav";
import { useSelector, useDispatch } from "react-redux";
import { unsetUser } from "../redux/user.js";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import useFetchUserData from "../hooks/Fetchdata";




const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userData, transactions, loading, error } = useFetchUserData();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useForm();
  const selectedType = watch("type", "expense"); 
  useEffect(() => {
    setValue("category", "");
  }, [selectedType, setValue]);

  //add to database
  const addTransaction = async (userId, transaction) => {
    const transactionRef = collection(db, `users/${userId}/transactions`);
    try {
      await addDoc(transactionRef, transaction);
      toast.success("Transaction added successfully!");
    } catch (error) {
      toast.error("Error adding transaction");
      console.error(error.message);
    }
  };

  const updateUserBalance = async (userId, transaction) => {
    const userRef = doc(db, "users", userId);
    const userData = await getDoc(userRef);

    const currentBalance = userData.data().totalBalance || 0;
    const currentIncome = userData.data().income || 0;
    const currentExpenses = userData.data().expenses || 0;

    const updatedBalance =
      transaction.type === "income"
        ? currentBalance + transaction.amount
        : currentBalance - transaction.amount;

    const updatedIncome =
      transaction.type === "income"
        ? currentIncome + transaction.amount
        : currentIncome;

    const updatedExpenses =
      transaction.type === "expense"
        ? currentExpenses + transaction.amount
        : currentExpenses;

    try {
      await updateDoc(userRef, {
        totalBalance: updatedBalance,
        income: updatedIncome,
        expenses: updatedExpenses,
      });
      toast.success("Balance, income, and expenses updated!");
    } catch (error) {
      toast.error("Error updating user balance and stats.");
      console.error("Error updating balance:", error.message);
    }
  };

  // this is will submit
  const onSubmit = async (data) => {
    const transaction = {
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      // date:moment().format('YYYY-MM-DD,h:mm:ss a'),
      date: new Date().toISOString(),
      description: data.description,
    };
    await addTransaction(user.id, transaction);
    await updateUserBalance(user.id, transaction);
    //  await FetchUserData()

    reset();
  };

  //this is logout
  const handleLogout = () => {
    try {
      signOut(googleAuth);
      dispatch(unsetUser());
    } catch (er) {
      console.log(er);
    }
  };
  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <Error500 />;
  }
  return (
    <div className="h-[100dvh] bg-gray-100 flex flex-col">
      <header className="bg-white p-4 shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>

        <div className="flex items-center space-x-4">
          {user?.photo ? (
            <img
              src={user.photo}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-gray-500" />
          )}

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-center mb-2">
              Current Balance
            </div>
            <div className="text-4xl font-bold text-center text-green-600">
              ₹{userData?.totalBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Income</p>
                <p className="text-xl font-bold text-green-600">
                ₹
                  {/* {transactions
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)} */}
                  {userData?.income.toFixed(2)}
                </p>
              </div>
              <ArrowUpRight className="text-green-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expenses</p>
                <p className="text-xl font-bold text-red-600">
                ₹
                  {/* {transactions
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)} */}
                  {userData?.expenses.toFixed(2)}

                </p>
              </div>
              <ArrowDownRight className="text-red-600" />
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>

        <div
          className="space-y-4 py-2 overflow-y-auto"
          style={{ maxHeight: "250px" }}
        >
          {transactions?.map((transaction, id) => (
            <Card key={id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-4 ${
                      transaction.type === "income"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <img
                      src={`${transaction.category}.png`}
                      alt={`${transaction.category} Icon`}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{transaction.category}</p>
                    {transaction.description && (
                      <p className="text-sm text-gray-500">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-bold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{transaction.amount.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* this is for add transaction */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg">
            <PlusCircle className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Transaction</SheetTitle>
            <SheetDescription>
              Add a new expense or income to your tracker.
            </SheetDescription>
          </SheetHeader>

          <form className="space-y-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={control}
                defaultValue="expense"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                {...register("amount", { required: true })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>

              <Controller
                name="category"
                control={control}
                defaultValue=""
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent>
                      {selectedType === "expense" ? (
                        <>
                          <SelectItem value="food">
                            <img
                              src="/food.png"
                              alt="Food Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Food
                          </SelectItem>
                          <SelectItem value="rent">
                            <img
                              src="/rent.png"
                              alt="Rent Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            House Rent
                          </SelectItem>
                          <SelectItem value="petrol">
                            <img
                              src="/petrol.png"
                              alt="Petrol Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Petrol
                          </SelectItem>
                          <SelectItem value="transportation">
                            <img
                              src="/transportation.png"
                              alt="Transport Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Transportation
                          </SelectItem>
                          <SelectItem value="roti">
                            <img
                              src="/roti.png"
                              alt="Roti Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Roti
                          </SelectItem>
                          <SelectItem value="cantine">
                            <img
                              src="/cantine.png"
                              alt="Roti Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Cantine
                          </SelectItem>
                          <SelectItem value="course">
                            <img
                              src="/course.png"
                              alt="Course Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Course
                          </SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="salary">
                            <img
                              src="/salary.png"
                              alt="Salary Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Salary
                          </SelectItem>
                          <SelectItem value="investment">
                            <img
                              src="/investment.png"
                              alt="Investment Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Investment
                          </SelectItem>
                          <SelectItem value="business">
                            <img
                              src="/business.png"
                              alt="Business Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Business
                          </SelectItem>
                          <SelectItem value="freelance">
                            <img
                              src="/freelance.png"
                              alt="Freelance Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Freelance
                          </SelectItem>
                          <SelectItem value="family">
                            <img
                              src="/family.png"
                              alt="Freelance Icon"
                              className="inline-block w-6 h-6 mr-2"
                            />
                            Family Sourse
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="description">Description(optional)</Label>
              <Input id="description" {...register("description")} />
            </div>

            <Button disabled={isSubmitting} type="submit" className="w-full">
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* this down navbar */}
      <Nav />
    </div>
  );
};

export default HomePage;
