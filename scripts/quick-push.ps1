param([string]$Message = "chore: update")
git add .
git commit -m "$Message"
git push
