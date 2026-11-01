const { randomBytes, scryptSync } = require("node:crypto");

const N = 32768, r = 8, p = 3;

function readPassword() {
  if (!process.stdin.isTTY) {
    return new Promise((resolve) => {
      let value = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", chunk => { value += chunk; });
      process.stdin.on("end", () => resolve(value.replace(/[\r\n]+$/u, "")));
    });
  }

  return new Promise((resolve, reject) => {
    let value = "";
    process.stdout.write("Admin password: ");
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.resume();
    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      resolve(value);
    };
    process.stdin.on("data", character => {
      if (character === "\u0003") {
        process.stdout.write("\n");
        process.stdin.setRawMode(false);
        process.stdin.pause();
        reject(new Error("Cancelled"));
      } else if (character === "\r" || character === "\n") finish();
      else if (character === "\u007f" || character === "\b") value = value.slice(0, -1);
      else value += character;
    });
  });
}

readPassword().then(password => {
  if (password.length < 12) throw new Error("Use a password with at least 12 characters.");
  const salt = randomBytes(16);
  const digest = scryptSync(password, salt, 64, { N, r, p, maxmem: 192 * 1024 * 1024 });
  process.stdout.write(`scrypt$${N}$${r}$${p}$${salt.toString("base64url")}$${digest.toString("base64url")}\n`);
}).catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
