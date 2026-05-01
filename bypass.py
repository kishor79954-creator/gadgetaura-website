import os
p = 'C:/Users/Kishore/Pictures/SocialAgent/dashboard/src/app/page.tsx'
f = open(p, 'r'); c = f.read(); f.close()

c = c.replace('import { UploadVideoArea } from "@/components/UploadVideoArea";', 'import { UploadVideoArea } from "@/components/UploadVideoArea";\nimport { ProfileCard } from "@/components/ProfileCard";')
c = c.replace('<UploadVideoArea />\n          </div>', '<UploadVideoArea />\n            <div className="mt-8">\n              <ProfileCard userId={userId} />\n            </div>\n          </div>')

f = open(p, 'w'); f.write(c); f.close()
print("UI INJECT DONE")
