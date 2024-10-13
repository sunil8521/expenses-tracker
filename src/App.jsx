import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingPage from "./comp/LoadingPage";
import { useEffect } from "react";
import Protect from "./comp/Protect";
const HomePage = lazy(() => import("./pages/HomePage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
import { useSelector, useDispatch } from "react-redux";
import { googleAuth } from "./firebase/config.js";
import { onAuthStateChanged } from "firebase/auth"; // Import Firebase Auth
import { setUser, unsetUser } from "./redux/user";

function App() {
  const { user, loader } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(googleAuth, (user) => {
      if (user) {
        dispatch(
          setUser({
            id: user.uid,
            displayname: user.displayName || "",
            email: user.email,
            photo: user.photoURL || "",
            total:user.totalBalance||0
          })
        );
      } else {
        dispatch(unsetUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loader) return <LoadingPage />;
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route element={<Protect user={user} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/reports" element={<Dashboard />} />
            </Route>

            <Route
              path="/auth"
              element={
                <Protect user={!user} redirect="/">
                  <SignInPage />
                </Protect>
              }
            />

            <Route path="*" element={<Navigate to={"/"} />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
