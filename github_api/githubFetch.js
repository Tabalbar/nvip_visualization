const { Octokit } = require("octokit");

const octokit = new Octokit({
  auth: "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",
});

const userLocations = [];

async function fetchUserByUsername(username) {
  const endpoint = `https://api.github.com/users/${username}`;
  const options = {
    headers: {
      Authorization: "token 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",
    },
  };
  const res = await fetch(endpoint, options);
  const data = await res.json();
  return data;
}

const fetchOwnerAndRepoContributors = async (owner, repo) => {
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/contributors?page=2&per_page=1000",
    {
      owner: owner,
      repo: repo,
    }
  );
  const data = response.data;

  return await data;
};

const data = fetchOwnerAndRepoContributors("apache", "tomcat");
data.then((data) => {
  console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    const userData = fetchUserByUsername(data[i].login);
    userData.then((data) => {
      const dataEntry = {
        username: data.login,
        count: 0,
        location: data.location,
      };
      const found = userLocations.find((element) => element === dataEntry);
      if (found) {
        found.count += dataEntry.count;
      } else {
        console.log(dataEntry);
        userLocations.push(dataEntry);
      }
    });
  }
});
