// Traditional Chinese, converted from ./zh-CN with OpenCC (Taiwan wording). One part per area of the interface;
// the parts hold disjoint namespaces, so they are simply spread together.
import part1 from './zh-TW/part1'
import part2 from './zh-TW/part2'
import part3 from './zh-TW/part3'
import part4 from './zh-TW/part4'
import part5 from './zh-TW/part5'
import part6 from './zh-TW/part6'
import part7 from './zh-TW/part7'
import part8 from './zh-TW/part8'
import part9 from './zh-TW/part9'
import part10 from './zh-TW/part10'
import part11 from './zh-TW/part11'
import part12 from './zh-TW/part12'
import part13 from './zh-TW/part13'
import { mergeParts } from './mergeParts'

export default mergeParts(part1, part2, part3, part4, part5, part6, part7, part8, part9, part10, part11, part12, part13)
