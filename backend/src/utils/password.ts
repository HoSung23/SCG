import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16)
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      const hash = `${salt.toString('hex')}:${derivedKey.toString('hex')}`
      resolve(hash)
    })
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(':')
  if (!saltHex || !keyHex) {
    return false
  }

  const salt = Buffer.from(saltHex, 'hex')

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(derivedKey.toString('hex') === keyHex)
    })
  })
}
