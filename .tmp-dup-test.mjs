const url = "http://localhost:3000/api/auth/sign-up/email";
const body = {
  name: "Dup Test",
  email: "dup.test.20261031@example.com",
  password: "DupTest1",
  image: "https://example.com/p.jpg",
};

for (let attempt = 1; attempt <= 2; attempt += 1) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
    },
    body: JSON.stringify(body),
  });

  console.log(`Attempt ${attempt}:`, response.status, await response.text());
}
