import {NextResponse} from 'next/server'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {BUILD_PROVENANCE} from '@/generated/buildProvenance'

export const dynamic='force-dynamic'
function currentBuildId(){
  try{
    const dist=process.env.NEXT_DIST_DIR||'.next'
    return readFileSync(join(process.cwd(),dist,'BUILD_ID'),'utf8').trim()
  }catch{return null}
}
export async function GET(){
  return NextResponse.json({...BUILD_PROVENANCE,buildId:currentBuildId()},{headers:{'Cache-Control':'no-store, private'}})
}
