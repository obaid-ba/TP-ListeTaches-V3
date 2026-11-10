// Lance Expo avec l'adresse de la carte Wi-Fi : sur un PC avec VMware ou
// VirtualBox, Expo peut sinon choisir une adresse injoignable par le téléphone.
const { spawn } = require('node:child_process');
const os = require('node:os');

function findLanAddress() {
  const candidates = Object.entries(os.networkInterfaces())
    .filter(([name]) => !/vmware|virtualbox|vethernet|wsl|bluetooth/i.test(name))
    .flatMap(([name, addresses]) =>
      addresses
        .filter(
          (item) =>
            item.family === 'IPv4' &&
            !item.internal &&
            !item.address.startsWith('169.254.')
        )
        .map((item) => ({ name, address: item.address }))
    );

  const wifi = candidates.find((item) => /wi-?fi|wlan/i.test(item.name));
  return (wifi ?? candidates[0])?.address;
}

const address = findLanAddress();
const env = { ...process.env };

if (address) {
  env.REACT_NATIVE_PACKAGER_HOSTNAME = address;
  console.log(`Adresse utilisée pour le QR code : ${address}`);
} else {
  console.warn('Aucune adresse Wi-Fi trouvée : Expo choisira lui-même.');
}

const command = ['npx expo start', ...process.argv.slice(2)].join(' ');
const expo = spawn(command, {
  env,
  shell: true,
  stdio: 'inherit',
});

expo.on('exit', (code) => process.exit(code ?? 0));
