import * as fs from '@extensions/fs'
import * as xml from '@extensions/xml'
import { basename } from 'path'
import { XmlElement } from '@extensions/xml'

export default async function (projectPath: string) {
  let result = {
    path: projectPath,
    projectName: basename(projectPath),
    packages: Array()
  }
  const content = await fs.readFile(projectPath)
  const document = await xml.parseToJson(content)
  let project = getProjectElement(document)

  project = project || { elements: [] }
  if (!project.elements || !Array.isArray(project.elements)) {
    project.elements = []
  }

  project.elements.forEach((element: any) => {
    if (element.name === 'ItemGroup') {
      if (!element.elements || !Array.isArray(element.elements)) {
        element.elements = []
      }

      element.elements.forEach((e: any) => {
        if (e.name === 'PackageReference') {
          result.packages.push({
            id: e.attributes.Include,
            version: e.attributes.Version
          })
        }
      })
    }
  })

  return result
}

function getProjectElement(document: XmlElement): XmlElement | undefined {
  if (document && document.elements) {
    if (document.elements.length === 1) {
      return ensureElements(document.elements[0])
    } else {
      for (let i = 0; i < document.elements.length; i++) {
        if (document.elements[i].type !== 'comment') {
          return ensureElements(document.elements[i])
        }
      }
    }
  }
}

function ensureElements(element: XmlElement): XmlElement {
  if (!element.elements || !Array.isArray(element.elements)) {
    element.elements = []
  }

  return element
}
