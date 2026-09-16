import type { AssignmentSpec } from '../types'
import { a00 } from './a00'
import { a01 } from './a01'
import { a02 } from './a02'
import { a03 } from './a03'
import { a04 } from './a04'
import { a05 } from './a05'
import { a06 } from './a06'
import { a07 } from './a07'
import { a08 } from './a08'
import { a09 } from './a09'
import { a10 } from './a10'
import { a11 } from './a11'
import { a12 } from './a12'
import { a13 } from './a13'
import { a14 } from './a14'
import { a15 } from './a15'
/**
 * MỞ MỘT BÀI MỚI:
 * 1. Viết src/content/aNN.ts theo khuôn của a02.ts (lý thuyết 5 tầng + task song ngữ)
 * 2. import vào đây và thay dòng locked() tương ứng
 */

export const assignments: AssignmentSpec[] = [
  a00,
  a01,
  a02,
  a03,
  a04,
  a05,
  a06,
  a07,
  a08,
  a09,
  a10,
  a11,
  a12,
  a13,
  a14,
  a15,
]

export const findAssignment = (id: string) => assignments.find((a) => a.id === id)