const sum = (a, b) => {
  if (a && b) {
    return a + b;
  }
  throw new Error("Invalid arguments");
};
try {
  console.log(sum(1));
} catch (err) {
  console.log("Error occured!", err);
}

console.log("This will still run");
