import * as argon2 from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id, // 推荐使用 argon2id，结合了 argon2i 和 argon2d 的优点
    memoryCost: 65536, // 64MB 内存
    timeCost: 3, // 迭代次数
    parallelism: 4, // 并行度
  })
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return argon2.verify(hash, password)
}
