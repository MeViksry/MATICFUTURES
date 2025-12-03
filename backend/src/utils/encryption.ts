// backend/src/utils/encryption.ts
import CryptoJS from 'crypto-js'
import { config } from '../config/env'

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, config.encryptionKey).toString()
}

export const decrypt = (encryptedText: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, config.encryptionKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString()
}

export const generateToken = (length: number = 32): string => {
  return CryptoJS.lib.WordArray.random(length).toString()
}