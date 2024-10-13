import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup,signInWithRedirect } from "firebase/auth";
import { googleAuth, provider,db} from "../firebase/config.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {setUser,unsetUser} from "../redux/user.js"
export default function SignInPage() {
const dispatc=useDispatch()

  const[Loading,setLoading]=useState(false)

  const createUserDocument = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);
   
    

    if (!userData.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          name: displayName ? displayName : name,
          email,
          photoURL: photoURL ? photoURL : "",
          createdAt,
          totalBalance: 0, 
          income:0,
          expenses:0

        });
        toast.success("Account Created!");
      } catch (error) {
        toast.error(error.message);
        console.error("Error creating user document: ", error);
      }
    }
  }



  const GoggleLogin = async () => {
    setLoading(true)
    try {
      const res = await signInWithPopup(googleAuth, provider);
      const user = res.user;

      await createUserDocument(user)
      dispatc(setUser({
        id:user.uid,
        displayname:user.displayName||"",
        email:user.email,
        photo:user.photoURL||"",
        total:user.totalBalance||0

      }))
      toast.success("User Authenticated Successfully!");
    } catch (error) {
      toast.error(error.message);
      console.error("Error signing in with Google: ", error.message);
    }finally{
      setLoading(false)
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in
          </CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
            disabled={Loading}
              className="w-full flex items-center justify-center"
              variant="outline"
              onClick={GoggleLogin}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
