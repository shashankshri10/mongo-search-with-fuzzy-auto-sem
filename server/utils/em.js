async function fetchData(str) {
  const url = "https://api.together.xyz/v1/embeddings";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization:
        "Bearer 4ed53c5ad29d17d59c9dae03d954057b7a8af5d0d021fa6c312baaa0ea0522e9",
    },
    body: JSON.stringify({
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
      input: str,
    }),
  };
  try {
    const res2 = await fetch(url, options);
    const res = await res2.json();
    const arr = res.data[0].embedding;
    // console.log("Emdbedding array:",arr);
    return arr;
  } catch (err) {
    console.error("error:" + err);
  }
}

module.exports = fetchData;
// fetchData(url, options);
