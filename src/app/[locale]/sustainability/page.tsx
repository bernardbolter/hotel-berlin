import { createScaffoldPage } from '@/lib/scaffolds/createPage'

const page = createScaffoldPage('sustainability')

export const generateMetadata = page.generateMetadata
export default page.Page
