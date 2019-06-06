const fs = require('fs-extra')
const path = require('path')
const { runCommand } = require('./utils')

const linuxDependencies = [
  '/lib/x86_64-linux-gnu/libbsd.so.0',
  '/lib/x86_64-linux-gnu/libc.so.6',
  '/lib/x86_64-linux-gnu/libcom_err.so.2',
  '/lib/x86_64-linux-gnu/libcrypt.so.1',
  '/lib/x86_64-linux-gnu/libdl.so.2',
  '/lib/x86_64-linux-gnu/libgcc_s.so.1',
  '/lib/x86_64-linux-gnu/libkeyutils.so.1',
  '/lib/x86_64-linux-gnu/liblzma.so.5',
  '/lib/x86_64-linux-gnu/libm.so.6',
  '/lib/x86_64-linux-gnu/libpthread.so.0',
  '/lib/x86_64-linux-gnu/libresolv.so.2',
  '/lib/x86_64-linux-gnu/librt.so.1',
  '/lib/x86_64-linux-gnu/libutil.so.1',
  '/lib/x86_64-linux-gnu/libz.so.1',
  '/usr/lib/swift/linux/libBlocksRuntime.so',
  '/usr/lib/swift/linux/libFoundation.so',
  '/usr/lib/swift/linux/libdispatch.so',
  '/usr/lib/swift/linux/libicudataswift.so.61',
  '/usr/lib/swift/linux/libicui18nswift.so.61',
  '/usr/lib/swift/linux/libicuucswift.so.61',
  '/usr/lib/swift/linux/libswiftCore.so',
  '/usr/lib/swift/linux/libswiftDispatch.so',
  '/usr/lib/swift/linux/libswiftGlibc.so',
  '/usr/lib/swift/linux/libswiftSwiftOnoneSupport.so',
  '/usr/lib/x86_64-linux-gnu/libasn1.so.8',
  '/usr/lib/x86_64-linux-gnu/libatomic.so.1',
  '/usr/lib/x86_64-linux-gnu/libcrypto.so.1.1',
  '/usr/lib/x86_64-linux-gnu/libcurl.so.4',
  '/usr/lib/x86_64-linux-gnu/libffi.so.6',
  '/usr/lib/x86_64-linux-gnu/libgmp.so.10',
  '/usr/lib/x86_64-linux-gnu/libgnutls.so.30',
  '/usr/lib/x86_64-linux-gnu/libgssapi.so.3',
  '/usr/lib/x86_64-linux-gnu/libgssapi_krb5.so.2',
  '/usr/lib/x86_64-linux-gnu/libhcrypto.so.4',
  '/usr/lib/x86_64-linux-gnu/libheimbase.so.1',
  '/usr/lib/x86_64-linux-gnu/libheimntlm.so.0',
  '/usr/lib/x86_64-linux-gnu/libhogweed.so.4',
  '/usr/lib/x86_64-linux-gnu/libhx509.so.5',
  '/usr/lib/x86_64-linux-gnu/libicudata.so.60',
  '/usr/lib/x86_64-linux-gnu/libicuuc.so.60',
  '/usr/lib/x86_64-linux-gnu/libidn2.so.0',
  '/usr/lib/x86_64-linux-gnu/libk5crypto.so.3',
  '/usr/lib/x86_64-linux-gnu/libkrb5.so.26',
  '/usr/lib/x86_64-linux-gnu/libkrb5.so.3',
  '/usr/lib/x86_64-linux-gnu/libkrb5support.so.0',
  '/usr/lib/x86_64-linux-gnu/liblber-2.4.so.2',
  '/usr/lib/x86_64-linux-gnu/libldap_r-2.4.so.2',
  '/usr/lib/x86_64-linux-gnu/libnettle.so.6',
  '/usr/lib/x86_64-linux-gnu/libnghttp2.so.14',
  '/usr/lib/x86_64-linux-gnu/libp11-kit.so.0',
  '/usr/lib/x86_64-linux-gnu/libpsl.so.5',
  '/usr/lib/x86_64-linux-gnu/libroken.so.18',
  '/usr/lib/x86_64-linux-gnu/librtmp.so.1',
  '/usr/lib/x86_64-linux-gnu/libsasl2.so.2',
  '/usr/lib/x86_64-linux-gnu/libsqlite3.so.0',
  '/usr/lib/x86_64-linux-gnu/libssl.so.1.1',
  '/usr/lib/x86_64-linux-gnu/libstdc++.so.6',
  '/usr/lib/x86_64-linux-gnu/libtasn1.so.6',
  '/usr/lib/x86_64-linux-gnu/libunistring.so.2',
  '/usr/lib/x86_64-linux-gnu/libwind.so.0',
  '/usr/lib/x86_64-linux-gnu/libxml2.so.2'
]

module.exports = {
  command: 'create-runtime',
  describe: 'Create the swift runtime layer on AWS',
  builder: {
    image: {
      alias: 'i',
      default: 'swift:5.0'
    }
  },
  handler: (argv) => {
    const dockerImage = argv.image
    const basePath = process.cwd()
    const buildPath = path.resolve(basePath, '.build')
    fs.removeSync(buildPath)
    fs.mkdirSync(buildPath)
    runCommand([
      'docker run',
      '--rm',
      `--volume "${buildPath}:/src"`,
      '--workdir "/src"',
      dockerImage,
      `cp /lib64/ld-linux-x86-64.so.2 .`
    ]).then(() => {
        fs.mkdirSync(path.join(buildPath, 'lib'))
        return runCommand([
          'docker run --rm',
          `--volume "${buildPath}:/src" --workdir "/src"`,
          dockerImage,
          'cp -t ./lib'
        ].concat(linuxDependencies))
      })
      .then(() => {
        let zipPath = path.join(basePath, 'generated')
        fs.mkdirSync(zipPath)
        zipPath = path.join(zipPath, 'swift-runtime.zip')
        fs.removeSync(zipPath)
        return runCommand([
          `cd ${buildPath}`, 
          '&&', 
          `zip -r ${zipPath} *`
        ])
      })
      .then(() => {
        console.log('Swift runtime generated.')
        console.log('Use aws command to create or update your layer in AWS.')
      })
  }
}
