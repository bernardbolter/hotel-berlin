import { createScaffoldPage } from '@/lib/scaffolds/createPage'

const page = createScaffoldPage('on-the-walls')

export const generateMetadata = page.generateMetadata
export default page.Page
