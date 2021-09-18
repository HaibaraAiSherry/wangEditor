/**
 * @description image menu helper
 * @author wangfupeng
 */

import { Transforms } from 'slate'
import { IDomEditor, DomEditor } from '@wangeditor/core'
import { ImageElement, ImageStyle } from './custom-types'
import { replaceSymbols } from '../../utils/util'

async function check(
  menuKey: string,
  editor: IDomEditor,
  src: string,
  alt: string = '',
  href: string = ''
): Promise<boolean> {
  const { checkImage } = editor.getMenuConfig(menuKey)
  if (checkImage) {
    const res = await checkImage(src, alt, href)
    if (typeof res === 'string') {
      // 检验未通过，提示信息
      editor.alert(res, 'error')
      return false
    }
    if (res == null) {
      // 检验未通过，不提示信息
      return false
    }
  }

  return true
}

export async function insertImageNode(
  editor: IDomEditor,
  src: string,
  alt: string = '',
  href: string = ''
) {
  const res = await check('insertImage', editor, src, alt, href)
  if (!res) return // 检查失败，终止操作

  // 新建一个 image node
  const image: ImageElement = {
    type: 'image',
    src: replaceSymbols(src),
    href,
    alt,
    style: {},
    children: [{ text: '' }], // 【注意】void node 需要一个空 text 作为 children
  }

  // 插入图片
  Transforms.insertNodes(editor, image)

  // 回调
  const { onInsertedImage } = editor.getMenuConfig('insertImage')
  if (onInsertedImage) onInsertedImage(image)
}

export async function updateImageNode(
  editor: IDomEditor,
  src: string,
  alt: string = '',
  href: string = '',
  style: ImageStyle = {}
) {
  const res = await check('editImage', editor, src, alt, href)
  if (!res) return // 检查失败，终止操作

  const selectedImageNode = DomEditor.getSelectedNodeByType(editor, 'image')
  if (selectedImageNode == null) return
  const { style: curStyle = {} } = selectedImageNode as ImageElement

  // 修改图片
  const nodeProps: Partial<ImageElement> = {
    src,
    alt,
    href,
    style: {
      ...curStyle,
      ...style,
    },
  }
  Transforms.setNodes(editor, nodeProps, {
    match: n => DomEditor.checkNodeType(n, 'image'),
  })

  // 回调
  const imageNode = DomEditor.getSelectedNodeByType(editor, 'image')
  const { onUpdatedImage } = editor.getMenuConfig('editImage')
  if (onUpdatedImage) onUpdatedImage(imageNode)
}