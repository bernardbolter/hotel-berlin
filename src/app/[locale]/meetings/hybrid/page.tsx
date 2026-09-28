import { createScaffoldPage } from '@/lib/scaffolds/createPage'

const page = createScaffoldPage('meetings-hybrid')

export const generateMetadata = page.generateMetadata
export default page.Page
