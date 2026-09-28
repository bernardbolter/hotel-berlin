import { createScaffoldPage } from '@/lib/scaffolds/createPage'

const page = createScaffoldPage('offers')

export const generateMetadata = page.generateMetadata
export default page.Page
