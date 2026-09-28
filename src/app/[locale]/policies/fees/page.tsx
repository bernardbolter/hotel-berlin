import { createScaffoldPage } from '@/lib/scaffolds/createPage'

const page = createScaffoldPage('policies-fees')

export const generateMetadata = page.generateMetadata
export default page.Page
