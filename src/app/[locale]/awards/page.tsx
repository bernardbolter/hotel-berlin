import { createScaffoldPage } from '@/lib/scaffolds/createPage'

const page = createScaffoldPage('awards')

export const generateMetadata = page.generateMetadata
export default page.Page
