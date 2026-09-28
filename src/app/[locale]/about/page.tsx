import { createScaffoldPage } from '@/lib/scaffolds/createPage'

const page = createScaffoldPage('about')

export const generateMetadata = page.generateMetadata
export default page.Page
