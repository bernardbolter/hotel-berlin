import { createScaffoldPage } from '@/lib/scaffolds/createPage'

const page = createScaffoldPage('people')

export const generateMetadata = page.generateMetadata
export default page.Page
