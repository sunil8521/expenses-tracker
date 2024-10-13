import { useSelector } from "react-redux";
import { doc, collection, query, orderBy  } from "firebase/firestore";
import { db } from "../firebase/config.js";
import { useDocument, useCollection } from "react-firebase-hooks/firestore";

const useFetchUserData = () => {
  const { user } = useSelector((state) => state.auth);
  const userRef = user?.id ? doc(db, "users", user.id) : null;
  const transactionRef = user?.id
    ? query(collection(db, `users/${user?.id}/transactions`), orderBy("date", "desc"))
    : null;
  const [userSnapshot, loadingUser, errorUser] = useDocument(userRef);
  const [transactionSnapshot, loadingTransactions, errorTransactions] =
    useCollection(transactionRef);

  const userData = userSnapshot?.exists() ? userSnapshot.data() : null;
  const transactions = transactionSnapshot
    ? transactionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    : [];

  const loading = loadingUser || loadingTransactions;
  const error = errorUser || errorTransactions;

  return { userData, transactions, loading, error };
};

export default useFetchUserData;
